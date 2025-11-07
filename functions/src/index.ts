/**
 * Firebase Cloud Functions
 * 
 * This file contains callable functions for:
 * 1. Razorpay Payment Processing
 * 2. Meeting & Call Management
 * 3. TURN Server Credentials
 * 4. Meeting Analytics
 * 
 * Environment Variables Required (set in Firebase Console):
 * - RAZORPAY_KEY_ID=rzp_live_RckdrRyNNy8thO
 * - RAZORPAY_KEY_SECRET=wzVq4ZV7Q0vw0IIpFyJkZjRj
 * - TURN_USERNAME (optional, for TURN server)
 * - TURN_PASSWORD (optional, for TURN server)
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Razorpay from "razorpay";
import * as crypto from "crypto";

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Razorpay with credentials from environment
// Support both legacy functions.config() and new environment variables
const getRazorpayKeyId = () => {
  try {
    return functions.config().razorpay?.key_id || process.env.RAZORPAY_KEY_ID || "";
  } catch {
    return process.env.RAZORPAY_KEY_ID || "";
  }
};

const getRazorpayKeySecret = () => {
  try {
    return functions.config().razorpay?.key_secret || process.env.RAZORPAY_KEY_SECRET || "";
  } catch {
    return process.env.RAZORPAY_KEY_SECRET || "";
  }
};

const razorpay = new Razorpay({
  key_id: getRazorpayKeyId(),
  key_secret: getRazorpayKeySecret(),
});

/**
 * Create Razorpay Order
 * Callable function that creates an order on Razorpay
 */
export const createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to create an order"
    );
  }

  const { amount, currency = "INR", planType, userId, userEmail } = data;

  // Validate input
  if (!amount || !planType || !userId || !userEmail) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: amount, planType, userId, userEmail"
    );
  }

  if (amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Amount must be greater than 0"
    );
  }

  // Verify userId matches authenticated user
  if (context.auth.uid !== userId) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "User ID does not match authenticated user"
    );
  }

  try {
    // Create order on Razorpay
    // payment_capture: 1 means auto-capture payment (as per Razorpay docs)
    // Receipt must be max 40 characters (Razorpay requirement)
    const timestamp = Date.now().toString().slice(-10); // Last 10 digits of timestamp
    const shortUserId = userId.slice(0, 20); // First 20 characters of userId
    const receipt = `${shortUserId}_${timestamp}`.slice(0, 40); // Ensure max 40 chars
    
    const order = await razorpay.orders.create({
      amount: amount, // Amount in paise (smallest currency subunit)
      currency: currency,
      receipt: receipt, // Max 40 characters
      payment_capture: 1 as any, // Auto-capture payment (1 = automatic, 0 = manual)
      notes: {
        planType: planType,
        userId: userId,
        userEmail: userEmail,
      },
    }) as any;

    // Log order creation
    console.log("✅ Razorpay order created:", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      userId: userId,
      planType: planType,
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error: any) {
    console.error("❌ Error creating Razorpay order:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to create order: ${error.message || "Unknown error"}`
    );
  }
});

/**
 * Verify Razorpay Payment
 * Callable function that verifies payment signature
 */
export const verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to verify payment"
    );
  }

  const { paymentId, orderId, signature, planType, userId } = data;

  // Validate input
  if (!paymentId || !orderId || !signature || !planType || !userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: paymentId, orderId, signature, planType, userId"
    );
  }

  // Verify userId matches authenticated user
  if (context.auth.uid !== userId) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "User ID does not match authenticated user"
    );
  }

  try {
    // Get Razorpay key secret
    const razorpaySecret = getRazorpayKeySecret();

    if (!razorpaySecret) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Razorpay key secret not configured"
      );
    }

    // Verify signature
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(text)
      .digest("hex");

    const isVerified = generatedSignature === signature;

    if (!isVerified) {
      console.error("❌ Payment signature verification failed:", {
        paymentId,
        orderId,
        expectedSignature: generatedSignature,
        receivedSignature: signature,
      });
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Payment signature verification failed"
      );
    }

    // Verify payment status from Razorpay API (Step 6: Verify Payment Status)
    let paymentStatus = "captured";
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      paymentStatus = payment.status;
      console.log("✅ Payment status from Razorpay:", paymentStatus);
    } catch (error: any) {
      console.warn("⚠️ Could not fetch payment status from Razorpay:", error);
      // Continue anyway - signature verification is the primary check
    }

    // Only update premium status if payment is captured
    if (paymentStatus !== "captured") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Payment not captured. Status: ${paymentStatus}`
      );
    }

    // Get user email from context
    const userEmail = context.auth.token.email || "";

    // Calculate subscription end date
    let subscriptionEndDate: admin.firestore.Timestamp | null = null;
    if (planType === "monthly") {
      subscriptionEndDate = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      );
    } else if (planType === "yearly") {
      subscriptionEndDate = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      );
    }
    // Student plan doesn't expire (subscriptionEndDate remains null)

    // Update user premium status in Firestore (Step 4: Store Fields in Server)
    // Store all required fields matching premiumUserService interface
    const premiumUsersRef = admin.firestore().collection("premium_users");
    await premiumUsersRef.doc(userId).set(
      {
        userId: userId,
        email: userEmail.toLowerCase(),
        isPremium: true,
        subscriptionType: planType,
        subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
        subscriptionEndDate: subscriptionEndDate,
        studentVerified: planType === "student" ? false : undefined, // Don't auto-verify students - requires manual approval
        paymentId: paymentId,
        orderId: orderId,
        lastPaymentId: paymentId,
        lastOrderId: orderId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log("✅ Payment verified and user premium status updated:", {
      paymentId,
      orderId,
      userId,
      planType,
    });

    return {
      success: true,
      verified: true,
    };
  } catch (error: any) {
    console.error("❌ Error verifying payment:", error);
    
    // If it's already an HttpsError, re-throw it
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Payment verification failed: ${error.message || "Unknown error"}`
    );
  }
});

/**
 * Get TURN Server Credentials
 * Returns TURN server credentials for WebRTC connections
 */
export const getTurnCredentials = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  try {
    // Generate temporary TURN credentials
    // In production, use a TURN server service like Twilio, Xirsys, or self-hosted
    const username = process.env.TURN_USERNAME || `user_${context.auth.uid}_${Date.now()}`;
    const password = process.env.TURN_PASSWORD || `pass_${Date.now()}`;
    
    // Default TURN servers (using free/public servers - replace with your own for production)
    const turnServers = [
      {
        urls: "stun:stun.l.google.com:19302",
        username: "",
        credential: ""
      },
      {
        urls: "stun:stun1.l.google.com:19302",
        username: "",
        credential: ""
      }
    ];

    // If you have TURN server credentials, add them here
    if (process.env.TURN_USERNAME && process.env.TURN_PASSWORD) {
      turnServers.push({
        urls: process.env.TURN_SERVER_URL || "turn:your-turn-server.com:3478",
        username: username,
        credential: password
      });
    }

    return {
      success: true,
      servers: turnServers,
      username: username,
      credential: password
    };
  } catch (error: any) {
    console.error("❌ Error getting TURN credentials:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to get TURN credentials: ${error.message || "Unknown error"}`
    );
  }
});

/**
 * Create Team Meeting
 * Creates a scheduled or instant team meeting
 */
export const createTeamMeeting = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { teamId, title, description, scheduledTime, isInstant } = data;

  if (!teamId || !title) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: teamId, title"
    );
  }

  try {
    // Verify user is a member of the team
    const teamRef = admin.firestore().collection("teams").doc(teamId);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Team not found"
      );
    }

    const teamData = teamDoc.data();
    const members = teamData?.members || [];
    const isMember = members.some((m: any) => m.id === context.auth.uid);

    if (!isMember) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "User is not a member of this team"
      );
    }

    // Generate meeting ID
    const meetingId = `meeting_${teamId}_${Date.now()}`;
    const meetingData = {
      meetingId,
      teamId,
      title,
      description: description || "",
      hostId: context.auth.uid,
      hostName: context.auth.token.name || context.auth.token.email || "Unknown",
      scheduledTime: scheduledTime ? admin.firestore.Timestamp.fromDate(new Date(scheduledTime)) : admin.firestore.FieldValue.serverTimestamp(),
      isInstant: isInstant || false,
      status: isInstant ? "active" : "scheduled",
      participants: [{
        userId: context.auth.uid,
        name: context.auth.token.name || context.auth.token.email || "Unknown",
        email: context.auth.token.email || "",
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        isHost: true
      }],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore().collection("teamMeetings").doc(meetingId).set(meetingData);

    // Notify team members if scheduled
    if (!isInstant && scheduledTime) {
      const notificationData = {
        type: "meeting_scheduled",
        teamId,
        meetingId,
        title,
        scheduledTime: admin.firestore.Timestamp.fromDate(new Date(scheduledTime)),
        hostName: context.auth.token.name || context.auth.token.email || "Unknown",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Create notifications for all team members except host
      const notificationPromises = members
        .filter((m: any) => m.id !== context.auth.uid)
        .map((member: any) => 
          admin.firestore().collection("notifications").add({
            ...notificationData,
            userId: member.id
          })
        );

      await Promise.all(notificationPromises);
    }

    console.log("✅ Team meeting created:", meetingId);

    return {
      success: true,
      meetingId,
      meeting: meetingData
    };
  } catch (error: any) {
    console.error("❌ Error creating team meeting:", error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to create meeting: ${error.message || "Unknown error"}`
    );
  }
});

/**
 * Log Call Analytics
 * Logs call events for analytics
 */
export const logCallEvent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { callId, eventType, callType, duration, participantCount, metadata } = data;

  if (!callId || !eventType) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: callId, eventType"
    );
  }

  try {
    const eventData = {
      callId,
      userId: context.auth.uid,
      eventType, // 'started', 'ended', 'failed', 'quality_change'
      callType: callType || "unknown", // 'video', 'audio', 'meeting'
      duration: duration || 0,
      participantCount: participantCount || 1,
      metadata: metadata || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore().collection("callAnalytics").add(eventData);

    return {
      success: true
    };
  } catch (error: any) {
    console.error("❌ Error logging call event:", error);
    // Don't throw error for analytics - it's non-critical
    return {
      success: false,
      error: error.message
    };
  }
});

/**
 * Send Meeting Reminder
 * Scheduled function to send meeting reminders
 */
export const sendMeetingReminders = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      const fifteenMinutesFromNow = admin.firestore.Timestamp.fromMillis(
        now.toMillis() + 15 * 60 * 1000
      );

      // Find meetings starting in the next 15 minutes
      const meetingsQuery = admin
        .firestore()
        .collection("teamMeetings")
        .where("status", "==", "scheduled")
        .where("scheduledTime", ">=", now)
        .where("scheduledTime", "<=", fifteenMinutesFromNow);

      const meetingsSnapshot = await meetingsQuery.get();

      const reminderPromises: Promise<any>[] = [];

      meetingsSnapshot.forEach((doc) => {
        const meeting = doc.data();
        const teamId = meeting.teamId;

        // Get team members
        admin
          .firestore()
          .collection("teams")
          .doc(teamId)
          .get()
          .then((teamDoc) => {
            const teamData = teamDoc.data();
            const members = teamData?.members || [];

            members.forEach((member: any) => {
              // Create reminder notification
              reminderPromises.push(
                admin.firestore().collection("notifications").add({
                  type: "meeting_reminder",
                  userId: member.id,
                  teamId,
                  meetingId: meeting.meetingId,
                  title: meeting.title,
                  scheduledTime: meeting.scheduledTime,
                  createdAt: admin.firestore.FieldValue.serverTimestamp()
                })
              );
            });
          });
      });

      await Promise.all(reminderPromises);

      console.log(`✅ Sent ${reminderPromises.length} meeting reminders`);
      return null;
    } catch (error: any) {
      console.error("❌ Error sending meeting reminders:", error);
      return null;
    }
  });

