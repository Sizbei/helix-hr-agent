"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ChatBar } from "@/components/ChatBar";
import { Workspace } from "@/components/Workspace";
import useHelixStore from "@/lib/store";

export default function Home() {
  const { messages, addMessage, setLoading, addSequence, addSequenceStep } =
    useHelixStore();

  // Simulate backend response for demo purposes
  useEffect(() => {
    // Listen for user messages to generate AI responses
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.sender === "user") {
      setLoading(true);

      // Simulate API call delay
      setTimeout(() => {
        // Process different types of user inputs
        const content = lastMessage.content.toLowerCase();

        if (
          content.includes("sales sequence") ||
          content.includes("recruiting sequence")
        ) {
          // Extract role from message (e.g. "Write a sales sequence for software engineers")
          const roleMatcher = content.match(/for\s+([a-z\s]+)/i);
          const role = roleMatcher
            ? roleMatcher[1].trim()
            : "Software Engineer";

          addMessage(
            `Starting a sequence for ${role}. Would you like to begin with an email or LinkedIn message?`,
            "ai"
          );

          // Create a new sequence
          const sequenceId = addSequence(role);
        } else if (content.includes("email")) {
          const activeSequence = useHelixStore.getState().getActiveSequence();

          if (activeSequence) {
            addMessage(
              "Great! I've added an email step to your sequence. What would you like to say in this email?",
              "ai"
            );

            // Add email step after delay
            setTimeout(() => {
              addSequenceStep(activeSequence.id, {
                stepType: "email",
                subject: `New opportunity at Trajillo Tech`,
                body: `Hi {{first name}} - I've been keeping up with the news in LA. I hope you and your family are safe. Let us know if we can help in any way.`,
                delay: 0,
                order: activeSequence.steps.length,
              });

              setLoading(true);

              // Simulate the AI thinking about the next step
              setTimeout(() => {
                addMessage(
                  "What would you like to say in the next step?",
                  "ai"
                );
                setLoading(false);
              }, 1000);
            }, 500);
          }
        } else if (
          content.includes("support with our gov") ||
          content.includes("aid program")
        ) {
          const activeSequence = useHelixStore.getState().getActiveSequence();

          if (activeSequence) {
            addMessage(
              "I've added information about the government aid program. Would you like to add another step?",
              "ai"
            );

            // Add email step with program info
            setTimeout(() => {
              addSequenceStep(activeSequence.id, {
                stepType: "email",
                subject: `Government Aid for Wildfire Recovery`,
                body: `I work at Trajillo Tech - we release a new government aid program for homeowners affected by the wildfires. Up to $2mil in aid. Let me know if you'd like to learn more.`,
                delay: 2,
                order: activeSequence.steps.length,
              });

              setLoading(true);

              // Add follow-up information
              setTimeout(() => {
                addSequenceStep(activeSequence.id, {
                  stepType: "email",
                  subject: `More details: Government Aid Program`,
                  body: `Also .. it's a fully government supported program. No cost or burden to you whatsoever.\n\nLet me know!`,
                  delay: 3,
                  order: activeSequence.steps.length + 1,
                });

                setLoading(false);
              }, 1000);
            }, 500);
          }
        } else if (
          content.includes("4th step") ||
          content.includes("reach out")
        ) {
          const activeSequence = useHelixStore.getState().getActiveSequence();

          if (activeSequence) {
            addMessage("I've added a follow-up step to your sequence.", "ai");

            // Add a 4th step
            setTimeout(() => {
              addSequenceStep(activeSequence.id, {
                stepType: "linkedin",
                body: `{{first_name}} - let me know if I can help! I'm here to serve as a resource.`,
                delay: 5,
                order: activeSequence.steps.length,
              });

              setLoading(false);
            }, 500);
          }
        } else {
          // Default response
          addMessage(
            'I can help you create recruiting sequences. Try saying "Write a recruiting sequence for software engineers" or "Create a sales sequence for homeowners in LA".',
            "ai"
          );
        }

        setLoading(false);
      }, 1500);
    }
  }, [messages, addMessage, setLoading, addSequence, addSequenceStep]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <div className="flex w-full h-full">
        <ChatBar />
        <Workspace />
      </div>
      <Toaster />
    </div>
  );
}
