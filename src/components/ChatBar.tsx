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
    <div className="w-2/5 h-full border-r border-slate-200 flex flex-col bg-white">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Chat</h2>
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
              <Avatar className="h-8 w-8 bg-blue-600">
                <span className="text-xs font-medium">AI</span>
              </Avatar>
            )}

            <Card
              className={cn(
                "relative",
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-900"
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
              <Avatar className="h-8 w-8 bg-slate-600">
                <span className="text-xs font-medium">YOU</span>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 bg-blue-600">
              <span className="text-xs font-medium">AI</span>
            </Avatar>
            <Card className="bg-slate-100 text-slate-900">
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
