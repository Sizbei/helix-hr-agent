import { useEffect, useState } from "react";
import useHelixStore from "./store";
import { APP_CONFIG } from "./config";
import { ApiService } from "./api";

export function useSession() {
  const { sessionId, setSessionId } = useHelixStore();
  const [isLoading, setIsLoading] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize or restore session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get existing session ID from localStorage
        const storedSessionId = localStorage.getItem("sessionId");
        const storedUserIdentifier = localStorage.getItem("userIdentifier");

        // Only restore session if it's not expired
        const lastActivity = localStorage.getItem("lastSessionActivity");
        const isSessionExpired =
          lastActivity &&
          Date.now() - parseInt(lastActivity) > APP_CONFIG.SESSION_TTL;

        // Create or restore session via API
        const response = await ApiService.createOrRestoreSession(
          isSessionExpired ? undefined : storedSessionId ?? undefined,
          storedUserIdentifier ?? undefined
        );

        if (response && response.data) {
          // Get session ID from response
          const newSessionId = response.data.sessionId;

          // Update Zustand store
          setSessionId(newSessionId);

          // Save to localStorage for persistence
          localStorage.setItem("sessionId", newSessionId);
          localStorage.setItem("lastSessionActivity", Date.now().toString());

          // If user provided an identifier, store it
          if (storedUserIdentifier) {
            setUserIdentifier(storedUserIdentifier);
          }

          // Import sequences if available
          if (response.data.sequences && response.data.sequences.length > 0) {
            // Use the ChatApiService to handle sequence updates
            const { ChatApiService } = await import("./chatapi");
            await ChatApiService.handleSequenceUpdate(response.data.sequences);
          }
        }
      } catch (err) {
        console.error("Error initializing session:", err);
        setError("Failed to initialize session");

        // Generate a new session ID if restore fails
        const newSessionId = generateUUID();
        setSessionId(newSessionId);
        localStorage.setItem("sessionId", newSessionId);
        localStorage.setItem("lastSessionActivity", Date.now().toString());
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [setSessionId]);

  // Update last activity timestamp periodically
  useEffect(() => {
    const updateActivity = () => {
      localStorage.setItem("lastSessionActivity", Date.now().toString());
    };

    // Update on user interaction
    window.addEventListener("click", updateActivity);
    window.addEventListener("keypress", updateActivity);

    // Also update every 5 minutes if the app is open
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keypress", updateActivity);
      clearInterval(interval);
    };
  }, []);

  // Register user email
  const registerEmail = async (email: string) => {
    try {
      setIsLoading(true);
      await ApiService.registerEmail(sessionId, email);

      // Update local state and storage
      setUserIdentifier(email);
      localStorage.setItem("userIdentifier", email);

      return true;
    } catch (err) {
      console.error("Error registering email:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all sessions for a user by email
  const getUserSessions = async (email: string) => {
    try {
      const response = await ApiService.getUserSessions(email);
      return response.data.sessions;
    } catch (err) {
      console.error("Error getting user sessions:", err);
      throw err;
    }
  };

  // Recover a specific session by email and sessionId
  const recoverSession = async (email: string, targetSessionId: string) => {
    try {
      setIsLoading(true);
      const response = await ApiService.recoverSession(email, targetSessionId);

      if (response && response.data) {
        // Update Zustand store
        setSessionId(targetSessionId);

        // Save to localStorage for persistence
        localStorage.setItem("sessionId", targetSessionId);
        localStorage.setItem("lastSessionActivity", Date.now().toString());
        localStorage.setItem("userIdentifier", email);
        setUserIdentifier(email);

        // Reset current store state
        useHelixStore.setState({
          messages: [
            {
              id: generateUUID(),
              sender: "ai",
              content:
                "Session recovered! How can I help you with your recruiting outreach?",
              timestamp: new Date(),
            },
          ],
          sequences: [],
          activeSequenceId: null,
        });

        // Import sequences if available
        if (response.data.sequences && response.data.sequences.length > 0) {
          // Use the ChatApiService to handle sequence updates
          const { ChatApiService } = await import("./chatapi");
          await ChatApiService.handleSequenceUpdate(response.data.sequences);
        }

        return true;
      }

      return false;
    } catch (err) {
      console.error("Error recovering session:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Export user sessions
  const exportSession = async () => {
    try {
      const response = await ApiService.exportSessionData(sessionId);
      return response.data;
    } catch (err) {
      console.error("Error exporting session:", err);
      throw err;
    }
  };

  // Import session data
  const importSession = async (importData: any) => {
    try {
      const response = await ApiService.importSessionData(
        sessionId,
        importData
      );

      if (response && response.data && response.data.sequences) {
        // Use the ChatApiService to handle sequence updates
        const { ChatApiService } = await import("./chatapi");
        await ChatApiService.handleSequenceUpdate(response.data.sequences);
      }

      return true;
    } catch (err) {
      console.error("Error importing session:", err);
      throw err;
    }
  };

  // Delete/deactivate the current session
  const deleteSession = async () => {
    try {
      await ApiService.deleteSession(sessionId);

      // Clear local storage
      localStorage.removeItem("sessionId");
      localStorage.removeItem("lastSessionActivity");

      // Generate a new session ID
      const newSessionId = generateUUID();
      setSessionId(newSessionId);
      localStorage.setItem("sessionId", newSessionId);
      localStorage.setItem("lastSessionActivity", Date.now().toString());

      // Reset store
      useHelixStore.setState({
        messages: [
          {
            id: generateUUID(),
            sender: "ai",
            content:
              "Hi, I'm Helix! I can help you create recruiting outreach sequences. What role are you hiring for?",
            timestamp: new Date(),
          },
        ],
        sequences: [],
        activeSequenceId: null,
      });

      return true;
    } catch (err) {
      console.error("Error deleting session:", err);
      throw err;
    }
  };

  return {
    sessionId,
    isLoading,
    userIdentifier,
    error,
    registerEmail,
    getUserSessions,
    recoverSession,
    exportSession,
    importSession,
    deleteSession,
  };
}

// Utility function to generate UUID (simplified version)
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
