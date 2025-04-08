"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ChatBar } from "@/components/ChatBar";
import { Workspace } from "@/components/Workspace";
import { Card, CardContent } from "@/components/ui/card";
import useHelixStore from "@/lib/store";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
// import { ApiService } from "@/lib/api";
import { toast } from "sonner";

export default function Home() {
  const {
    messages,
    sequences,
    addMessage,
    setLoading,
    sessionId,
    addSequence,
    addSequenceStep,
  } = useHelixStore();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.sender === "user") {
      setLoading(true);

      async function processMessage() {
        try {
          // This would be the real API call in production
          // Uncomment when backend is ready
          /*
          const data = await ApiService.sendMessage(
            lastMessage.content,
            sessionId
          );
          
          if (data.response) {
            addMessage(data.response, "ai");
          }
          
          // Handle sequence updates if they exist
          if (data.sequenceUpdate) {
            const { role, steps } = data.sequenceUpdate;
            
            // Check if this sequence already exists
            const existingSequence = sequences.find(seq => seq.role.toLowerCase() === role.toLowerCase());
            
            if (existingSequence) {
              // Add steps to existing sequence
              steps.forEach(step => {
                if (step) {
                  addSequenceStep(existingSequence.id, {
                    stepType: step.stepType || "email",
                    subject: step.subject,
                    body: step.body || "",
                    delay: step.delay || 0,
                    order: step.order || existingSequence.steps.length
                  });
                }
              });
            } else {
              // Create a new sequence with these steps
              const newSequenceId = addSequence(role);
              
              steps.forEach(step => {
                if (step) {
                  addSequenceStep(newSequenceId, {
                    stepType: step.stepType || "email",
                    subject: step.subject,
                    body: step.body || "",
                    delay: step.delay || 0,
                    order: step.order || 0
                  });
                }
              });
            }
          }
          */

          // For development: simulate API response
          // Remove this when backend is ready
          setTimeout(() => {
            const content = lastMessage.content.toLowerCase();

            if (
              content.includes("recruiting") ||
              content.includes("hire") ||
              content.includes("sequence")
            ) {
              // Try to extract a role from the message
              const roleMatcher = content.match(/for\s+([a-z\s]+)/i);
              const roleName = roleMatcher ? roleMatcher[1].trim() : null;

              if (roleName) {
                // Simulate creating a sequence for the role
                addMessage(
                  `I can help you create a recruiting sequence for ${roleName}. Would you like to start with an email or LinkedIn message?`,
                  "ai"
                );

                // Create a new sequence
                if (
                  !sequences.some(
                    (seq) => seq.role.toLowerCase() === roleName.toLowerCase()
                  )
                ) {
                  addSequence(roleName);
                }
              } else {
                addMessage(
                  "I can help you create recruiting sequences. What role are you hiring for?",
                  "ai"
                );
              }
            } else {
              addMessage(
                "I'm here to help you create recruiting sequences. Please tell me what role you're hiring for or ask me to create a specific type of outreach sequence.",
                "ai"
              );
            }

            setLoading(false);
          }, 1000);
        } catch (error) {
          console.error("Error processing message:", error);
          addMessage(
            "Sorry, there was an error processing your request. Please try again.",
            "ai"
          );
          toast.error(
            "Failed to communicate with the server. Please try again."
          );
          setLoading(false);
        }
      }

      processMessage();
    }
  }, [
    messages,
    addMessage,
    setLoading,
    sessionId,
    sequences,
    addSequence,
    addSequenceStep,
  ]);

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-background-alt p-6">
      <Card className="w-full max-w-7xl h-[90vh] overflow-hidden bg-background border-border shadow-2xl">
        <CardContent className="p-0">
          <div className="flex flex-col w-full h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-foreground">HELIX AI</h1>
                <div className="ml-1 px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                  HR AGENT
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="border-border"
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 border-t border-border overflow-hidden">
              <ChatBar />
              {sequences.length > 0 ? (
                <Workspace />
              ) : (
                <div className="w-3/5 h-full">
                  <EmptyState />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
