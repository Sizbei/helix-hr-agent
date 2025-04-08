import { Sequence, SequenceStep } from "@/lib/store";

// Define the API base URL - this would be set in your environment config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// API response types
interface ChatResponse {
  response: string;
  sequenceUpdate?: {
    role: string;
    steps: Partial<SequenceStep>[];
  };
}

interface SequencesResponse {
  sequences: Sequence[];
}

interface SequenceUpdateResponse {
  success: boolean;
  updatedSequence: Sequence;
}

interface NewSequenceResponse {
  success: boolean;
  newSequence: Sequence;
}

// Error handler utility function
const handleApiError = (error: any) => {
  console.error("API Error:", error);

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error("Response data:", error.response.data);
    console.error("Status:", error.response.status);
    return {
      error: error.response.data.message || "Server error",
      status: error.response.status,
    };
  } else if (error.request) {
    // The request was made but no response was received
    console.error("No response received:", error.request);
    return {
      error: "No response from server. Please check your connection.",
      status: 0,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("Request error:", error.message);
    return {
      error: "Error creating request: " + error.message,
      status: 0,
    };
  }
};

// API Service functions
export const ApiService = {
  // Chat endpoint to process user messages
  async sendMessage(message: string, sessionId: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all sequences for a session
  async getSequences(sessionId: string): Promise<SequencesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sequences/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update a sequence step
  async updateSequenceStep(
    sessionId: string,
    sequenceId: string,
    stepId: string,
    updates: Partial<SequenceStep>
  ): Promise<SequenceUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sequence/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: sequenceId,
          stepId,
          updates,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create a new sequence
  async createSequence(
    sessionId: string,
    role: string
  ): Promise<NewSequenceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sequence/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, role }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add a new step to a sequence
  async addSequenceStep(
    sessionId: string,
    sequenceId: string,
    stepData: Omit<SequenceStep, "id">
  ): Promise<SequenceUpdateResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sequence/${sessionId}/step`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: sequenceId,
            step: stepData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete a sequence step
  async deleteSequenceStep(
    sessionId: string,
    sequenceId: string,
    stepId: string
  ): Promise<SequenceUpdateResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sequence/${sessionId}/step/${stepId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: sequenceId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete an entire sequence
  async deleteSequence(
    sessionId: string,
    sequenceId: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sequence/${sessionId}/${sequenceId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
