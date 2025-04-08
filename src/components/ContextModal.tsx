"use client";

import { useState } from "react";
import { Database, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useHelixStore from "@/lib/store";
import { toast } from "sonner";
import { ApiService } from "@/lib/api";

// Default context template
const DEFAULT_CONTEXT = `You are Helix, an AI HR Agent designed to help recruiters craft outreach sequences for different roles.
Your goal is to create tailored recruiting messages for email and LinkedIn based on the role and preferences.

To create a good sequence, you need the following information:
1. Job role (e.g., Software Engineer, Product Manager)
2. Tone preference (casual, professional, friendly, etc.)
3. Target candidate profile (years of experience, skills, etc.)
4. Preferred outreach channels (email, LinkedIn, or both)

Please ask me about each of these if I don't provide them.`;

export function ContextInitModal() {
  const { sessionId } = useHelixStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contextContent, setContextContent] = useState(DEFAULT_CONTEXT);
  const [isSaving, setIsSaving] = useState(false);
  const [isContextModified, setIsContextModified] = useState(false);
  const [activeTab, setActiveTab] = useState("context");

  const handleSaveContext = async () => {
    setIsSaving(true);
    try {
      // Call the API to set context
      await ApiService.initializeContext(sessionId, contextContent);
      setIsContextModified(true);
      toast.success("Context initialized successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error setting context:", error);
      toast.error("Failed to initialize context");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetContext = () => {
    setContextContent(DEFAULT_CONTEXT);
    toast.info("Context reset to default");
  };

  const isContextChanged = contextContent !== DEFAULT_CONTEXT;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className={isContextModified ? "bg-primary/10 border-primary" : ""}
      >
        <Database className="h-4 w-4 mr-1" />
        {isContextModified ? "Context Initialized" : "Initialize Context"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Initialize AI Context</span>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="context">Context Template</TabsTrigger>
              <TabsTrigger value="help">Help & Tips</TabsTrigger>
            </TabsList>
            <TabsContent value="context" className="py-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Customize the AI context to control how Helix interacts with
                  recruiters. This will be used as the system prompt for the AI
                  agent.
                </p>
                <Textarea
                  value={contextContent}
                  onChange={(e) => setContextContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Enter context here..."
                />
              </div>
            </TabsContent>
            <TabsContent value="help" className="py-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Tips for Context Initialization
                </h3>
                <p className="text-sm text-muted-foreground">
                  This context acts as the system prompt for the AI assistant.
                  Here are some tips:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>
                    Be specific about what information the AI should collect
                  </li>
                  <li>
                    Define the tone and style for different types of messages
                  </li>
                  <li>Include guidelines for email subject lines</li>
                  <li>Specify the structure for follow-up messages</li>
                  <li>Set expectations for message length and formality</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Changes to this context will affect how the AI responds to all
                  future interactions in this session.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between items-center pt-4 border-t">
            <div>
              {isContextChanged && (
                <Button
                  variant="outline"
                  onClick={handleResetContext}
                  size="sm"
                >
                  Reset to Default
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveContext}
                disabled={isSaving || !isContextChanged}
                className={
                  isContextChanged ? "bg-primary hover:bg-primary/90" : ""
                }
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Initialize Context
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
