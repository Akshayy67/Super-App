export const callGeminiAPI = async (prompt: string) => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gemini API call failed");
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated"
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};

// SendGrid functionality removed - using EmailJS instead
