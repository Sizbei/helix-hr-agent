import { Sequence, SequenceStep } from "@/lib/store";
import axios from "axios";

// Define the API base URL - this would be set in your environment config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Setup axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  async sendMessage(message: string, sessionId: string): Promise<any> {
    try {
      const response = await api.post("/chat", { message, sessionId });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all sequences for a session
  async getSequences(sessionId: string): Promise<any> {
    try {
      const response = await api.get(`/sequence/all/${sessionId}`);
      return response.data;
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
  ): Promise<any> {
    try {
      const response = await api.put(`/sequence/${sessionId}/step/${stepId}`, {
        updates: {
          step_type: updates.stepType,
          subject: updates.subject,
          body: updates.body,
          delay: updates.delay,
          order: updates.order,
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create a new sequence
  async createSequence(sessionId: string, role: string): Promise<any> {
    try {
      const response = await api.post(`/sequence/new`, { sessionId, role });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add a new step to a sequence
  async addSequenceStep(
    sessionId: string,
    sequenceId: string,
    stepData: any
  ): Promise<any> {
    try {
      const response = await api.post(`/sequence/${sessionId}/step`, {
        role: sequenceId,
        step_data: {
          step_type: stepData.stepType,
          subject: stepData.subject,
          body: stepData.body,
          delay: stepData.delay,
          order: stepData.order,
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete a sequence step
  async deleteSequenceStep(
    sessionId: string,
    sequenceId: string,
    stepId: string
  ): Promise<any> {
    try {
      const response = await api.delete(
        `/sequence/${sessionId}/step/${stepId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete an entire sequence
  async deleteSequence(sessionId: string, sequenceId: string): Promise<any> {
    try {
      const response = await api.delete(
        `/sequence/${sessionId}/role/${sequenceId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Initialize a context for a session
  async initializeContext(sessionId: string, context: string): Promise<any> {
    try {
      const response = await api.post(`/context/${sessionId}`, {
        context,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // SESSION MANAGEMENT API ENDPOINTS

  // Create or restore a session
  async createOrRestoreSession(
    sessionId?: string,
    userIdentifier?: string
  ): Promise<any> {
    try {
      const response = await api.post("/user/session", {
        sessionId,
        userIdentifier,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Register email with an existing session
  async registerEmail(sessionId: string, email: string): Promise<any> {
    try {
      const response = await api.post("/user/register", {
        sessionId,
        email,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Recover a specific session by email and sessionId
  async recoverSession(email: string, sessionId: string): Promise<any> {
    try {
      const response = await api.post("/user/recover", {
        email,
        sessionId,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all sessions for a user
  async getUserSessions(userIdentifier: string): Promise<any> {
    try {
      const response = await api.get(
        `/user/sessions/${encodeURIComponent(userIdentifier)}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete/deactivate a session
  async deleteSession(sessionId: string): Promise<any> {
    try {
      const response = await api.delete(`/user/session/${sessionId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Export session data
  async exportSessionData(sessionId: string): Promise<any> {
    try {
      const response = await api.get(`/user/session/${sessionId}/export`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Import session data
  async importSessionData(sessionId: string, importData: any): Promise<any> {
    try {
      const response = await api.post("/user/session/import", {
        sessionId,
        importData,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Reorder sequence steps
  async reorderSequenceSteps(
    sessionId: string,
    role: string,
    stepOrder: string[]
  ): Promise<any> {
    try {
      const response = await api.post(`/sequence/${sessionId}/reorder`, {
        role,
        stepOrder,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Clone a sequence to a new role
  async cloneSequence(
    sessionId: string,
    sourceRole: string,
    newRole: string
  ): Promise<any> {
    try {
      const response = await api.post(`/sequence/${sessionId}/clone`, {
        sourceRole,
        newRole,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
