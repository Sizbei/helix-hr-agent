"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import useHelixStore from "@/lib/store";

// Define the base URL - this would be set in your environment config
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function WebSocketClient() {
  const socketRef = useRef<Socket | null>(null);
  const {
    sessionId,
    addMessage,
    sequences,
    addSequence,
    addSequenceStep,
    updateSequenceStep,
  } = useHelixStore();
  const processedMessagesRef = useRef(new Set<string>());

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(SOCKET_URL);
    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("WebSocket connected");

      // Join room for this session
      socketInstance.emit("join", { sessionId });
    });

    socketInstance.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    // Listen for chat message events with duplicate prevention
    socketInstance.on("chat_message", (data) => {
      if (data.response) {
        // Create a unique ID for this message to prevent duplicates
        const messageId = `${data.response}-${Date.now()}`;

        // Only process if we haven't seen this message recently
        if (!processedMessagesRef.current.has(messageId)) {
          processedMessagesRef.current.add(messageId);
          addMessage(data.response, "ai");

          // Clean up old messages from the set after a delay
          setTimeout(() => {
            processedMessagesRef.current.delete(messageId);
          }, 5000);
        }
      }
    });

    // Listen for sequence update events
    socketInstance.on("sequence_update", (data) => {
      if (data.role && data.steps) {
        // Check if this sequence already exists (case-insensitive)
        const existingSequence = useHelixStore
          .getState()
          .sequences.find(
            (seq) => seq.role.toLowerCase() === data.role.toLowerCase()
          );

        if (existingSequence) {
          // Add/update steps to existing sequence
          data.steps.forEach((step: any) => {
            if (step) {
              // Check if step already exists (by id)
              const existingStep = existingSequence.steps.find(
                (s) => s.id === step.id
              );

              if (existingStep) {
                // Update existing step
                updateSequenceStep(existingSequence.id, step.id, {
                  stepType: step.step_type || existingStep.stepType,
                  subject:
                    step.subject !== undefined
                      ? step.subject
                      : existingStep.subject,
                  body: step.body !== undefined ? step.body : existingStep.body,
                  delay:
                    step.delay !== undefined ? step.delay : existingStep.delay,
                  order:
                    step.order !== undefined ? step.order : existingStep.order,
                });
              } else {
                // Add new step
                addSequenceStep(existingSequence.id, {
                  stepType: step.step_type || "email",
                  subject: step.subject,
                  body: step.body || "",
                  delay: step.delay || 0,
                  order: step.order || existingSequence.steps.length,
                });
              }
            }
          });
        } else {
          // Create a new sequence with these steps
          const newSequenceId = addSequence(data.role);

          data.steps.forEach((step: any) => {
            if (step) {
              addSequenceStep(newSequenceId, {
                stepType: step.step_type || "email",
                subject: step.subject,
                body: step.body || "",
                delay: step.delay || 0,
                order: step.order || 0,
              });
            }
          });
        }
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave", { sessionId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [sessionId, addMessage, addSequence, addSequenceStep, updateSequenceStep]);

  // This is a utility component that doesn't render anything visible
  return null;
}
