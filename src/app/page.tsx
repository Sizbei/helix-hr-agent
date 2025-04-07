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

export default function Home() {
  const { messages, addMessage, setLoading, addSequence, addSequenceStep } =
    useHelixStore();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.sender === "user") {
      setLoading(true);

      setTimeout(() => {
        const content = lastMessage.content.toLowerCase();

        if (
          content.includes("sales sequence") ||
          content.includes("recruiting sequence")
        ) {
          const roleMatcher = content.match(/for\s+([a-z\s]+)/i);
          const role = roleMatcher
            ? roleMatcher[1].trim()
            : "Software Engineer";

          addMessage(
            `Starting a sequence for ${role}. Would you like to begin with an email or LinkedIn message?`,
            "ai"
          );
        } else if (content.includes("email")) {
          const activeSequence = useHelixStore.getState().getActiveSequence();

          if (activeSequence) {
            addMessage(
              "Great! I've added an email step to your sequence. What would you like to say in this email?",
              "ai"
            );

            setTimeout(() => {
              addSequenceStep(activeSequence.id, {
                stepType: "email",
                subject: `New opportunity at Trajillo Tech`,
                body: `Hi {{first name}} - I've been keeping up with the news in LA. I hope you and your family are safe. Let us know if we can help in any way.`,
                delay: 0,
                order: activeSequence.steps.length,
              });

              setLoading(true);

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

            setTimeout(() => {
              addSequenceStep(activeSequence.id, {
                stepType: "email",
                subject: `Government Aid for Wildfire Recovery`,
                body: `I work at Trajillo Tech - we release a new government aid program for homeowners affected by the wildfires. Up to $2mil in aid. Let me know if you'd like to learn more.`,
                delay: 2,
                order: activeSequence.steps.length,
              });

              setLoading(true);

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
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-zinc-950 p-6">
      <Card className="w-full max-w-7xl h-[90vh] overflow-hidden bg-zinc-900 border-zinc-800 shadow-2xl">
        <CardContent className="p-0">
          <div className="flex flex-col w-full h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-zinc-100">HELIX AI</h1>
                <div className="ml-1 px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-md">
                  HR AGENT
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">3 ACTIVE TASKS</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 border-t border-zinc-800 overflow-hidden">
              <ChatBar />
              <Workspace />
            </div>
          </div>
        </CardContent>
      </Card>
      <Toaster theme="dark" />
    </div>
  );
}
