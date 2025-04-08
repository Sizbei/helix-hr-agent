import axios from "axios";
import useHelixStore, { Sequence, SequenceStep } from "./store";
import { toast } from "sonner";

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ChatApiService {
  /**
   * Process a user message and handle the response
   */
  static async processMessage(message: string): Promise<void> {
    const { sessionId, setLoading, addMessage } = useHelixStore.getState();

    try {
      setLoading(true);

      // Send message to the backend
      const response = await axios.post(`${API_URL}/chat`, {
        message,
        sessionId,
      });

      // Process the response
      const data = response.data;

      // Add AI response to chat
      if (data.response) {
        addMessage(data.response, "ai");
      }

      // Handle sequence updates - this is critical for workspace updates
      if (data.sequenceUpdate) {
        await ChatApiService.handleSequenceUpdate(data.sequenceUpdate);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      toast.error("Failed to process message. Please try again.");

      // Add fallback error message
      addMessage(
        "I'm having trouble processing your message right now. Please try again.",
        "ai"
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle sequence updates from the backend
   */
  static async handleSequenceUpdate(sequenceUpdate: any): Promise<void> {
    // Check if sequenceUpdate is an array of sequences
    const sequences = Array.isArray(sequenceUpdate)
      ? sequenceUpdate
      : [sequenceUpdate];

    if (sequences.length === 0) {
      return;
    }

    const store = useHelixStore.getState();
    const {
      sequences: existingSequences,
      addSequence,
      addSequenceStep,
      removeSequenceStep,
      setActiveSequence,
    } = store;

    // Process each sequence in the update
    for (const sequence of sequences) {
      if (!sequence || !sequence.role) continue;

      // Find if this sequence already exists in our store
      const existingSequenceIndex = existingSequences.findIndex(
        (seq) => seq.role.toLowerCase() === sequence.role.toLowerCase()
      );

      if (existingSequenceIndex >= 0) {
        // Get the existing sequence
        const existingSequence = existingSequences[existingSequenceIndex];

        // Clear existing steps if needed
        if (sequence.steps && Array.isArray(sequence.steps)) {
          // Remove all existing steps
          const existingSteps = [...existingSequence.steps];
          for (const step of existingSteps) {
            removeSequenceStep(existingSequence.id, step.id);
          }

          // Add the new steps
          for (const step of sequence.steps) {
            addSequenceStep(existingSequence.id, {
              stepType: step.step_type || "email",
              subject: step.subject,
              body: step.body || "",
              delay: step.delay || 0,
              order: step.order || 0,
            });
          }
        }

        // Set this sequence as active
        setActiveSequence(existingSequence.id);
      } else {
        // Create a new sequence
        const newSequenceId = addSequence(sequence.role);

        // Add steps to the new sequence
        if (sequence.steps && Array.isArray(sequence.steps)) {
          for (const step of sequence.steps) {
            addSequenceStep(newSequenceId, {
              stepType: step.step_type || "email",
              subject: step.subject,
              body: step.body || "",
              delay: step.delay || 0,
              order: step.order || 0,
            });
          }
        }

        // Set the new sequence as active
        setActiveSequence(newSequenceId);

        // Show toast notification
        toast.success(`Created sequence for ${sequence.role}`);
      }
    }
  }

  /**
   * Suggest the next step for a sequence
   */
  static async suggestNextStep(role: string): Promise<any> {
    const { sessionId, addMessage, setLoading } = useHelixStore.getState();

    try {
      setLoading(true);

      // Get suggestion from the backend
      const response = await axios.get(
        `${API_URL}/chat/suggest/${sessionId}/${role}`
      );

      const data = response.data;

      // Add suggestion to chat
      if (data.response) {
        addMessage(data.response, "ai");
      }

      return data.suggestion;
    } catch (error) {
      console.error("Error suggesting next step:", error);
      toast.error("Failed to get suggestions. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Add a suggested step to a sequence
   */
  static async addSuggestedStep(role: string, suggestion: any): Promise<void> {
    const { sessionId, addMessage, setLoading } = useHelixStore.getState();

    try {
      setLoading(true);

      // Add the suggested step
      const response = await axios.post(
        `${API_URL}/sequence/${sessionId}/step`,
        {
          role,
          step_data: {
            step_type: suggestion.channel,
            subject:
              suggestion.channel === "email"
                ? `Follow-up: ${role} opportunity`
                : null,
            body:
              suggestion.content ||
              `Follow-up on our previous conversation about the ${role} position.`,
            delay: suggestion.delay || 0,
          },
        }
      );

      const data = response.data;

      // Add confirmation to chat
      addMessage(
        `Added a new ${suggestion.channel} step to your sequence.`,
        "ai"
      );

      // Handle sequence updates
      if (data.success) {
        // Fetch updated sequences to refresh the workspace
        await ChatApiService.fetchSequences();
      }
    } catch (error) {
      console.error("Error adding suggested step:", error);
      toast.error("Failed to add suggested step. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetch all sequences for a session
   */
  static async fetchSequences(): Promise<void> {
    const { sessionId, setLoading } = useHelixStore.getState();

    try {
      setLoading(true);

      // Get sequences from API
      const response = await axios.get(`${API_URL}/sequence/all/${sessionId}`);

      const data = response.data;

      if (data.sequences) {
        await ChatApiService.handleSequenceUpdate(data.sequences);
      }
    } catch (error) {
      console.error("Error fetching sequences:", error);
      toast.error("Failed to load sequences. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Create a new sequence
   */
  static async createSequence(role: string): Promise<void> {
    const { sessionId, setLoading, addSequence, setActiveSequence } =
      useHelixStore.getState();

    try {
      setLoading(true);

      // Call API to create a new empty sequence
      const response = await axios.post(`${API_URL}/sequence/new`, {
        sessionId,
        role,
      });

      const data = response.data;

      if (data.success) {
        // Create sequence locally and set as active
        const newSequenceId = addSequence(role);
        setActiveSequence(newSequenceId);
        toast.success(`Created sequence for ${role}`);
      }
    } catch (error) {
      console.error("Error creating sequence:", error);
      toast.error("Failed to create sequence. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Update a sequence step
   */
  static async updateSequenceStep(
    sequenceId: string,
    stepId: string,
    updates: Partial<SequenceStep>
  ): Promise<void> {
    const { sessionId, setLoading } = useHelixStore.getState();

    try {
      setLoading(true);

      // Call API to update a step
      const response = await axios.put(
        `${API_URL}/sequence/${sessionId}/step/${stepId}`,
        {
          updates,
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success("Step updated successfully");
      }
    } catch (error) {
      console.error("Error updating step:", error);
      toast.error("Failed to update step. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Delete a sequence step
   */
  static async deleteSequenceStep(
    sequenceId: string,
    stepId: string
  ): Promise<void> {
    const { sessionId, setLoading } = useHelixStore.getState();

    try {
      setLoading(true);

      // Call API to delete a step
      const response = await axios.delete(
        `${API_URL}/sequence/${sessionId}/step/${stepId}`
      );

      const data = response.data;

      if (data.success) {
        toast.success("Step removed successfully");
      }
    } catch (error) {
      console.error("Error deleting step:", error);
      toast.error("Failed to remove step. Please try again.");
    } finally {
      setLoading(false);
    }
  }
}
