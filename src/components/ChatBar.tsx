"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
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
    <div className="w-2/5 h-full border-r border-zinc-800 flex flex-col bg-zinc-900">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-zinc-100">User Chatbox</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3 max-w-[85%]",
              message.sender === "user" ? "ml-auto" : ""
            )}
          >
            {message.sender === "ai" && (
              <Avatar className="h-8 w-8 bg-indigo-600">
                <span className="text-xs font-medium">AI</span>
              </Avatar>
            )}

            <Card
              className={cn(
                "relative",
                message.sender === "user"
                  ? "bg-indigo-600 text-zinc-100 border-0"
                  : "bg-zinc-800 text-zinc-100 border-zinc-700"
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
              <Avatar className="h-8 w-8 bg-zinc-700">
                <span className="text-xs font-medium">YOU</span>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 bg-indigo-600">
              <span className="text-xs font-medium">AI</span>
            </Avatar>
            <Card className="bg-zinc-800 text-zinc-100 border-zinc-700">
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:ring-indigo-500"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
