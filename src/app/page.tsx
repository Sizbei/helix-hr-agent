"use client";

import { Toaster } from "@/components/ui/sonner";
import { ChatBar } from "@/components/ChatBar";
import { Workspace } from "@/components/Workspace";
import { Card, CardContent } from "@/components/ui/card";
import useHelixStore from "@/lib/store";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { WebSocketClient } from "@/components/WebSocketClient";
import { MemoryDebugButton } from "@/components/MemoryDebug";
import { ContextInitModal } from "@/components/ContextModal";

export default function Home() {
  const { sequences } = useHelixStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-background-alt p-6">
      <Card className="w-full max-w-7xl h-[90vh] overflow-hidden bg-background border-border shadow-2xl">
        <CardContent className="p-0 h-full flex flex-col">
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
                <ContextInitModal />
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
                <MemoryDebugButton />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 border-t border-border overflow-hidden">
              <ChatBar />
              {sequences.length > 0 ? (
                <Workspace />
              ) : (
                <div className="w-3/5 h-full overflow-y-auto">
                  <EmptyState />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Toaster />
      <WebSocketClient />
    </div>
  );
}
