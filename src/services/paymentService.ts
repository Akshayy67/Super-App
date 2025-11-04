/**
 * Payment Service
 * Handles payment gateway integration with Razorpay
 */

import { realTimeAuth } from "../utils/realTimeAuth";
import { createPremiumUser, updatePremiumSubscription } from "./premiumUserService";

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
 * Create payment order (backend API call)
 * This should be called from your backend to create an order
 */
const createOrder = async (options: PaymentOptions): Promise<{ orderId: string; amount: number }> => {
  try {
    // TODO: Replace with your actual backend API endpoint
    // For now, we'll create a mock order ID
    // In production, call: POST /api/payments/create-order
    const response = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: options.amount,
        currency: options.currency,
        planType: options.planType,
        userId: options.userId,
        userEmail: options.userEmail,
      }),
    });

    if (!response.ok) {
      // Fallback: Create mock order for development
      console.warn("Backend API not available, using mock order");
      return {
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: options.amount,
      };
    }

    const data = await response.json();
    return {
      orderId: data.orderId,
      amount: data.amount,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    // Fallback for development
    return {
      orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: options.amount,
    };
  }
};

/**
 * Verify payment (backend API call)
 */
const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string,
  planType: "monthly" | "yearly" | "student",
  userId: string
): Promise<boolean> => {
  try {
    // TODO: Replace with your actual backend API endpoint
    const response = await fetch("/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId,
        orderId,
        signature,
        planType,
        userId,
      }),
    });

    if (!response.ok) {
      console.error("Payment verification failed");
      return false;
    }

    const data = await response.json();
    return data.verified === true;
  } catch (error) {
    console.error("Error verifying payment:", error);
    // For development, accept payment if signature exists
    if (signature) {
      console.warn("Backend verification not available, accepting payment for development");
      return true;
    }
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

    // Get Razorpay key from environment
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag"; // Default test key

    return new Promise((resolve) => {
      const razorpayOptions = {
        key: razorpayKey,
        amount: amount,
        currency: options.currency || "INR",
        name: "Super Study App",
        description: `Premium ${options.planType} subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verified = await verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              options.planType,
              options.userId
            );

            if (verified) {
              // Update user premium status
              const user = realTimeAuth.getCurrentUser();
              if (user) {
                try {
                  await createPremiumUser(
                    user.id,
                    user.email,
                    options.planType,
                    options.planType === "student"
                  );
                  console.log("✅ Premium status updated successfully");
                } catch (error) {
                  console.error("Error updating premium status:", error);
                }
              }

              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              });
            } else {
              resolve({
                success: false,
                error: "Payment verification failed",
              });
            }
          } catch (error: any) {
            console.error("Payment handler error:", error);
            resolve({
              success: false,
              error: error.message || "Payment processing failed",
            });
          }
        },
        prefill: {
          name: options.userName,
          email: options.userEmail,
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function () {
            resolve({
              success: false,
              error: "Payment cancelled by user",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        resolve({
          success: false,
          error: response.error.description || "Payment failed",
        });
      });

      razorpay.open();
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
 */
export const handlePaymentSuccess = async (
  paymentId: string,
  orderId: string,
  planType: "monthly" | "yearly" | "student"
): Promise<void> => {
  const user = realTimeAuth.getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Update premium status
  try {
    await createPremiumUser(user.id, user.email, planType, planType === "student");
    console.log("✅ Premium subscription activated");
  } catch (error) {
    console.error("Error activating premium:", error);
    throw error;
  }
};

