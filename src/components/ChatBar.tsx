"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import useHelixStore from "@/lib/store";
import { format } from "date-fns";

export function ChatBar() {
  const [inputMessage, setInputMessage] = useState("");
  const { messages, addMessage, isLoading } = useHelixStore();

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      addMessage(inputMessage.trim(), "user");
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="w-2/5 h-full border-r border-border flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">User Chatbox</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.sender === "ai" && (
              <Avatar className="size-7 flex-shrink-0">
                <AvatarImage src="/person2.jpg" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}

            <Card
              className={cn(
                "max-w-[70%] min-w-[40%]",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground border-0"
                  : "bg-card text-card-foreground border-border"
              )}
            >
              <CardContent className="p-3">
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {format(message.timestamp, "h:mm a")}
                </span>
              </CardContent>
            </Card>

            {message.sender === "user" && (
              <Avatar className="size-7 flex-shrink-0">
                <AvatarImage src="/person2.jpg" alt="User" />
                <AvatarFallback>YOU</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <Avatar className="size-7 flex-shrink-0">
              <AvatarImage src="/person2.jpg" alt="AI" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <Card className="bg-card text-card-foreground border-border max-w-[60%] min-w-[60%]">
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-input border-input-border text-input-foreground focus-visible:ring-primary"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
