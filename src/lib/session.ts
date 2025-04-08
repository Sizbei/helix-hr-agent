// File: lib/session.ts
import { useState, useEffect, useCallback } from "react";

// Base API URL - should be configured from environment in a real app
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface UseSessionReturn {
  sessionId: string;
  userIdentifier: string | null;
  registerEmail: (email: string) => Promise<boolean>;
  exportSession: () => Promise<any>;
  importSession: (data: any) => Promise<boolean>;
  deleteSession: () => Promise<boolean>;
  getUserSessions: (email: string) => Promise<any[]>;
  recoverSession: (email: string, sessionId: string) => Promise<boolean>;
}

export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string>("");
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      // Generate a new session ID if none exists
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem("sessionId", newSessionId);
    }

    if (storedEmail) {
      setUserIdentifier(storedEmail);
    }
  }, []);

  // Generate a UUID for session ID
  const generateSessionId = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  // Register an email with the current session
  const registerEmail = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_URL}/session/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to register email");
        }

        // Store email in local storage
        localStorage.setItem("userEmail", email);
        setUserIdentifier(email);

        return true;
      } catch (error) {
        console.error("Error registering email:", error);
        return false;
      }
    },
    [sessionId]
  );

  // Get user sessions by email
  const getUserSessions = useCallback(async (email: string): Promise<any[]> => {
    try {
      const response = await fetch(
        `${API_URL}/session/user/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get user sessions");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error getting user sessions:", error);
      return [];
    }
  }, []);

  // Recover a specific session
  const recoverSession = useCallback(
    async (email: string, targetSessionId: string): Promise<boolean> => {
      try {
        // First, verify the session exists and belongs to this email
        const sessions = await getUserSessions(email);
        const sessionExists = sessions.some(
          (session) => session.session_id === targetSessionId
        );

        if (!sessionExists) {
          throw new Error(
            "Session not found or not associated with this email"
          );
        }

        // Set the session ID and email in local storage
        localStorage.setItem("sessionId", targetSessionId);
        localStorage.setItem("userEmail", email);

        // Update state
        setSessionId(targetSessionId);
        setUserIdentifier(email);

        // Reload the page to refresh data with the new session
        window.location.reload();

        return true;
      } catch (error) {
        console.error("Error recovering session:", error);
        return false;
      }
    },
    [getUserSessions]
  );

  // Export session data
  const exportSession = useCallback(async (): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/session/export/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export session data");
      }

      return await response.json();
    } catch (error) {
      console.error("Error exporting session:", error);
      throw error;
    }
  }, [sessionId]);

  // Import session data
  const importSession = useCallback(async (data: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/session/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to import session data");
      }

      const result = await response.json();

      if (result.sessionId) {
        // Switch to the imported session
        setSessionId(result.sessionId);
        localStorage.setItem("sessionId", result.sessionId);

        // Reload the page to refresh data with the new session
        window.location.reload();
      }

      return true;
    } catch (error) {
      console.error("Error importing session:", error);
      return false;
    }
  }, []);

  // Delete current session
  const deleteSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/session/${sessionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      // Generate a new session ID
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem("sessionId", newSessionId);

      // Clear user identifier
      setUserIdentifier(null);
      localStorage.removeItem("userEmail");

      // Reload the page to refresh data with the new session
      window.location.reload();

      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  }, [sessionId]);

  return {
    sessionId,
    userIdentifier,
    registerEmail,
    exportSession,
    importSession,
    deleteSession,
    getUserSessions,
    recoverSession,
  };
}
