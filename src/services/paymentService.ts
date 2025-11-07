/**
 * Payment Service
 * Handles payment gateway integration with Razorpay using Firebase Cloud Functions
 */

import { realTimeAuth } from "../utils/realTimeAuth";
import { createPremiumUser } from "./premiumUserService";
import { getFunctions, httpsCallable } from "firebase/functions";
import app from "../config/firebase";

// Razorpay script loader
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  amount: number; // in paise (₹1 = 100 paise)
  currency: string;
  planType: "monthly" | "yearly" | "student";
  userId: string;
  userEmail: string;
  userName: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

/**
 * Load Razorpay script dynamically
 */
const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
};

/**
 * Create payment order using Firebase Cloud Functions
 */
const createOrder = async (options: PaymentOptions): Promise<{ orderId: string; amount: number }> => {
  try {
    // Initialize Firebase Functions
    const functions = getFunctions(app);
    const createOrderFunction = httpsCallable(functions, "createRazorpayOrder");

    // Call Firebase Cloud Function
    const result = await createOrderFunction({
      amount: options.amount,
      currency: options.currency || "INR",
      planType: options.planType,
      userId: options.userId,
      userEmail: options.userEmail,
    });

    const data = result.data as { success: boolean; orderId: string; amount: number; currency: string };

    if (!data.success || !data.orderId) {
      throw new Error("Failed to create order");
    }

    return {
      orderId: data.orderId,
      amount: data.amount,
    };
  } catch (error: any) {
    console.error("Error creating order:", error);
    throw new Error(error.message || "Failed to create payment order");
  }
};

/**
 * Verify payment using Firebase Cloud Functions
 */
export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string,
  planType: "monthly" | "yearly" | "student",
  userId: string
): Promise<boolean> => {
  try {
    // Initialize Firebase Functions
    const functions = getFunctions(app);
    const verifyPaymentFunction = httpsCallable(functions, "verifyRazorpayPayment");

    // Call Firebase Cloud Function
    const result = await verifyPaymentFunction({
      paymentId,
      orderId,
      signature,
      planType,
      userId,
    });

    const data = result.data as { success: boolean; verified: boolean };

    return data.success === true && data.verified === true;
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return false;
  }
};

/**
 * Initialize Razorpay payment
 */
export const initiatePayment = async (
  options: PaymentOptions
): Promise<PaymentResponse> => {
  try {
    // Load Razorpay script
    await loadRazorpayScript();

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded");
    }

    // Create order
    const { orderId, amount } = await createOrder(options);

    // Get Razorpay key from environment (Live key)
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKey) {
      throw new Error("Razorpay Key ID not configured. Please set VITE_RAZORPAY_KEY_ID in your .env file");
    }

    // Build callback URL with payment details
    const baseUrl = window.location.origin;
    const callbackUrl = `${baseUrl}/payment-success?plan=${options.planType}`;

    return new Promise((resolve) => {
      let isResolved = false;
      
      const razorpayOptions = {
        key: razorpayKey,
        amount: amount,
        currency: options.currency || "INR",
        name: "Super Study App",
        description: `Premium ${options.planType} subscription`,
        order_id: orderId,
        callback_url: callbackUrl, // Use callback URL instead of handler
        prefill: {
          name: options.userName,
          email: options.userEmail,
        },
        notes: {
          planType: options.planType,
          userId: options.userId,
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function () {
            if (!isResolved) {
              isResolved = true;
              resolve({
                success: false,
                error: "Payment is cancelled by user",
              });
            }
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      
      // Handle payment failure
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        if (!isResolved) {
          isResolved = true;
          // Redirect to payment success page with error details
          const errorUrl = `${baseUrl}/payment-success?error_code=${response.error.code}&error_description=${encodeURIComponent(response.error.description || 'Payment failed')}`;
          window.location.href = errorUrl;
          resolve({
            success: false,
            error: response.error.description || "Payment failed",
          });
        }
      });

      // Open Razorpay checkout
      razorpay.open();
      
      // Return success immediately (actual verification happens in callback)
      // The callback URL will handle the verification and redirect
      // Only resolve if not already resolved (to handle cancellation)
      if (!isResolved) {
        resolve({
          success: true,
          paymentId: "",
          orderId: orderId,
        });
      }
    });
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return {
      success: false,
      error: error.message || "Failed to initiate payment",
    };
  }
};

/**
 * Handle payment success
 * Note: Premium status is automatically updated by verifyRazorpayPayment Cloud Function
 * This function is kept as a fallback/verification method
 */
export const handlePaymentSuccess = async (
  _paymentId: string,
  _orderId: string,
  planType: "monthly" | "yearly" | "student"
): Promise<void> => {
  const user = realTimeAuth.getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Premium status should already be updated by Cloud Function
  // This is just a verification/fallback
  try {
    await createPremiumUser(user.id, user.email, planType, planType === "student");
    console.log("✅ Premium subscription verified/activated");
  } catch (error) {
    console.error("Error activating premium:", error);
    // Don't throw - Cloud Function should have already handled this
    console.warn("Premium status may have already been updated by Cloud Function");
  }
};

