import { ApiService } from "@/lib/api";
import useHelixStore from "@/lib/store";
import { toast } from "sonner";

// Track processed responses to prevent duplicates
const processedResponses = new Set<string>();

/**
 * ChatApiService provides methods for handling chat operations
 * with backend integration and state management
 */
export class ChatApiService {
  /**
   * Process a user message, send it to the backend, and handle the response
   * @param message The user's message text
   */
  static async processMessage(message: string) {
    const {
      sessionId,
      addMessage,
      setLoading,
      sequences,
      addSequence,
      addSequenceStep,
    } = useHelixStore.getState();

    try {
      setLoading(true);

      // Call the API
      const data = await ApiService.sendMessage(message, sessionId);

      // Handle AI response
      if (data.response) {
        // Create a unique identifier for this response
        const responseId = `${data.response.substring(0, 20)}-${Date.now()}`;

        if (!processedResponses.has(responseId)) {
          processedResponses.add(responseId);
          addMessage(data.response, "ai");

          // Clean up old entries after a while
          setTimeout(() => {
            processedResponses.delete(responseId);
          }, 5000);
        }
      }

      // Handle sequence updates if they exist
      if (data.sequenceUpdate) {
        const { role, steps } = data.sequenceUpdate;

        // Check if this sequence already exists
        const existingSequence = sequences.find(
          (seq) => seq.role.toLowerCase() === role.toLowerCase()
        );

        if (existingSequence) {
          // Add steps to existing sequence
          steps.forEach((step) => {
            if (step) {
              addSequenceStep(existingSequence.id, {
                stepType: step.stepType || "email",
                subject: step.subject,
                body: step.body || "",
                delay: step.delay || 0,
                order: step.order || existingSequence.steps.length,
              });
            }
          });
        } else {
          // Create a new sequence with these steps
          const newSequenceId = addSequence(role);

          steps.forEach((step) => {
            if (step) {
              addSequenceStep(newSequenceId, {
                stepType: step.stepType || "email",
                subject: step.subject,
                body: step.body || "",
                delay: step.delay || 0,
                order: step.order || 0,
              });
            }
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error processing message:", error);
      addMessage(
        "Sorry, there was an error processing your request. Please try again.",
        "ai"
      );
      toast.error("Failed to communicate with the server. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Request a suggestion for the next step in a sequence
   * @param roleName The role for which to suggest a next step
   */
  static async suggestNextStep(roleName: string) {
    const { sessionId, addMessage, setLoading, sequences } =
      useHelixStore.getState();

    try {
      setLoading(true);

      // Find the sequence for this role
      const sequence = sequences.find(
        (seq) => seq.role.toLowerCase() === roleName.toLowerCase()
      );

      if (!sequence) {
        toast.error(`No sequence found for ${roleName}`);
        return null;
      }

      // Get current sequence steps to analyze
      const currentSteps = sequence.steps;

      // Use the API to get a suggestion
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      try {
        // Try to use the real API
        const suggestionData = await fetch(`${API_BASE_URL}/chat/suggest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            role: roleName,
            currentSequence: currentSteps.map((step) => ({
              stepType: step.stepType,
              subject: step.subject,
              body: step.body,
              delay: step.delay,
              order: step.order,
            })),
          }),
        }).then((res) => {
          if (!res.ok) {
            throw new Error(`API returned ${res.status}`);
          }
          return res.json();
        });

        // Add the suggestion to the chat
        if (suggestionData.response) {
          // Create a unique identifier for this suggestion
          const suggestionId = `${suggestionData.response.substring(
            0,
            20
          )}-${Date.now()}`;

          if (!processedResponses.has(suggestionId)) {
            processedResponses.add(suggestionId);
            addMessage(suggestionData.response, "ai");

            // Clean up old entries after a while
            setTimeout(() => {
              processedResponses.delete(suggestionId);
            }, 5000);
          }
        }

        return suggestionData.suggestion;
      } catch (apiError) {
        console.warn("API call failed, using fallback logic:", apiError);

        // Fallback: Use client-side logic to suggest the next step
        // Determine what the next logical step would be based on the current sequence
        const lastStep =
          currentSteps.length > 0
            ? currentSteps[currentSteps.length - 1]
            : null;

        // If no steps or last step was email, suggest LinkedIn
        // If last step was LinkedIn, suggest email
        const suggestedChannel =
          !lastStep || lastStep.stepType === "email" ? "linkedin" : "email";

        // Suggest a delay of 2-3 days for follow-ups
        const suggestedDelay = currentSteps.length > 0 ? 2 : 0;

        // Create suggestion message
        const suggestionMessage =
          currentSteps.length === 0
            ? `Would you like to start with a ${suggestedChannel} message for ${roleName}?`
            : `Would you like to add a follow-up ${suggestedChannel} message after ${suggestedDelay} days?`;

        // Add suggestion to chat
        const fallbackId = `${suggestionMessage.substring(
          0,
          20
        )}-${Date.now()}`;
        if (!processedResponses.has(fallbackId)) {
          processedResponses.add(fallbackId);
          addMessage(suggestionMessage, "ai");

          setTimeout(() => {
            processedResponses.delete(fallbackId);
          }, 5000);
        }

        // Return suggestion data
        return {
          type: "follow_up",
          channel: suggestedChannel,
          delay: suggestedDelay,
          content:
            currentSteps.length === 0
              ? "Initial outreach"
              : "Follow up on previous communication",
        };
      }
    } catch (error) {
      console.error("Error getting suggestion:", error);
      toast.error("Failed to get a suggestion");
      return null;
    } finally {
      setLoading(false);
    }
  }
}
