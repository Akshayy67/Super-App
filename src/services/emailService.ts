import emailjs from "@emailjs/browser";

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_i4ksmkg",
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_FEEDBACK_TEMPLATE_ID || "template_00lom57", // Feedback template ID
  TEMPLATE_URGENT_ID: "template_lhf0w0m", // Your urgent template ID (if needed)
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "xKbkJUlAG_JHj3d9b",
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export interface FeedbackData {
  type: "feedback" | "suggestion" | "bug" | "feature";
  rating?: number;
  category: string;
  title: string;
  description: string;
  email?: string;
  priority?: "low" | "medium" | "high";
  featureName?: string;
  actionName?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send feedback via EmailJS
   */
  async sendFeedback(feedbackData: FeedbackData): Promise<boolean> {
    try {
      // Prepare email template parameters with all recipients in the message
      const templateParams = {
        // Basic feedback info
        feedback_type: feedbackData.type.toUpperCase(),
        feedback_title: feedbackData.title,
        feedback_description: feedbackData.description,
        feedback_category: feedbackData.category,

        // User info
        user_email: feedbackData.email || "Anonymous",

        // Ratings and priority
        rating: feedbackData.rating
          ? `${feedbackData.rating}/5 stars`
          : "Not provided",
        priority: feedbackData.priority || "medium",

        // Context info
        feature_name: feedbackData.featureName || "General",
        action_name: feedbackData.actionName || "N/A",

        // Technical info
        timestamp: new Date(feedbackData.timestamp).toLocaleString(),
        user_agent: feedbackData.userAgent || navigator.userAgent,
        page_url: feedbackData.url || window.location.href,

        // Formatted message for email body
        formatted_message: this.formatFeedbackMessage(feedbackData),

        // Recipients list for the template
        recipients_list:
          "akshay.juluri@super-app.tech, gyanmote.akhil@super-app.tech, support@super-app.tech, admin@super-app.tech",

        // Primary recipient (your main email)
        to_email: "akshay.juluri@super-app.tech",

        // Additional recipients as separate fields (if your template supports them)
        cc_email_1: "gyanmote.akhil@super-app.tech",
        cc_email_2: "support@super-app.tech",
        cc_email_3: "admin@super-app.tech",
      };

      console.log("📧 Sending feedback email with params:", templateParams);

      // Send single email with all recipients
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      console.log("✅ Feedback email sent successfully:", response.status);
      return true;
    } catch (error) {
      console.error("❌ Failed to send feedback email:", error);

      // Fallback: Store in localStorage for manual retrieval
      this.storeFeedbackLocally(feedbackData);

      return false;
    }
  }

  /**
   * Format feedback data into a readable email message
   */
  private formatFeedbackMessage(data: FeedbackData): string {
    const lines = [
      `🎯 FEEDBACK TYPE: ${data.type.toUpperCase()}`,
      `📝 TITLE: ${data.title}`,
      `📂 CATEGORY: ${data.category}`,
      "",
      `💬 DESCRIPTION:`,
      data.description,
      "",
    ];

    if (data.rating) {
      lines.push(`⭐ RATING: ${data.rating}/5 stars`);
    }

    if (data.priority) {
      lines.push(`🚨 PRIORITY: ${data.priority.toUpperCase()}`);
    }

    if (data.featureName) {
      lines.push(`🔧 FEATURE: ${data.featureName}`);
    }

    if (data.actionName) {
      lines.push(`⚡ ACTION: ${data.actionName}`);
    }

    lines.push("");
    lines.push(`👤 USER EMAIL: ${data.email || "Anonymous"}`);
    lines.push(`🕒 TIMESTAMP: ${new Date(data.timestamp).toLocaleString()}`);
    lines.push(`🌐 PAGE URL: ${data.url || window.location.href}`);
    lines.push(`💻 USER AGENT: ${data.userAgent || navigator.userAgent}`);

    return lines.join("\n");
  }

  /**
   * Store feedback locally as fallback
   */
  private storeFeedbackLocally(feedbackData: FeedbackData): void {
    try {
      const existingFeedback = localStorage.getItem("superapp-feedback-queue");
      const feedbackQueue = existingFeedback
        ? JSON.parse(existingFeedback)
        : [];

      feedbackQueue.push({
        ...feedbackData,
        storedAt: new Date().toISOString(),
        status: "pending",
      });

      localStorage.setItem(
        "superapp-feedback-queue",
        JSON.stringify(feedbackQueue)
      );
      console.log("💾 Feedback stored locally for manual retrieval");
    } catch (error) {
      console.error("Failed to store feedback locally:", error);
    }
  }

  /**
   * Get pending feedback from localStorage
   */
  getPendingFeedback(): any[] {
    try {
      const stored = localStorage.getItem("superapp-feedback-queue");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to retrieve pending feedback:", error);
      return [];
    }
  }

  /**
   * Clear pending feedback queue
   */
  clearPendingFeedback(): void {
    localStorage.removeItem("superapp-feedback-queue");
  }

  /**
   * Send a quick notification email for high-priority feedback
   */
  async sendUrgentNotification(feedbackData: FeedbackData): Promise<void> {
    if (feedbackData.priority === "high" || feedbackData.type === "bug") {
      try {
        const urgentParams = {
          subject: `🚨 URGENT: ${feedbackData.type.toUpperCase()} - ${
            feedbackData.title
          }`,
          message: `High priority ${feedbackData.type} reported:\n\n${feedbackData.description}`,
          user_email: feedbackData.email || "Anonymous",
          timestamp: new Date(feedbackData.timestamp).toLocaleString(),

          // Recipients
          to_email: "akshay.juluri@super-app.tech",
          cc_email_1: "gyanmote.akhil@super-app.tech",
          cc_email_2: "support@super-app.tech",
          cc_email_3: "admin@super-app.tech",
          recipients_list:
            "akshay.juluri@super-app.tech, gyanmote.akhil@super-app.tech, support@super-app.tech, admin@super-app.tech",
        };

        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_URGENT_ID, // template_lhf0w0m
          urgentParams
        );

        console.log("🚨 Urgent notification sent to all recipients");
      } catch (error) {
        console.error("Failed to send urgent notification:", error);
      }
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();

// Helper function for easy access
export const sendFeedbackEmail = async (
  feedbackData: FeedbackData
): Promise<boolean> => {
  // Add additional context
  const enrichedData: FeedbackData = {
    ...feedbackData,
    timestamp: feedbackData.timestamp || new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  const success = await emailService.sendFeedback(enrichedData);

  // Send urgent notification if needed
  if (success) {
    await emailService.sendUrgentNotification(enrichedData);
  }

  return success;
};
