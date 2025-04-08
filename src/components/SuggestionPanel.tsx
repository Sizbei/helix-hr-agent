"use client";

import { useState } from "react";
import { AlertCircle, X, PlusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChatApiService } from "@/lib/chatapi";
import useHelixStore from "@/lib/store";

type SuggestionProps = {
  suggestion: {
    type: string;
    channel: string;
    delay: number;
    content: string;
  };
  role: string;
  onDismissed?: () => void;
};

export function SuggestionPanel({
  suggestion,
  role,
  onDismissed,
}: SuggestionProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { setActiveSequence } = useHelixStore();

  const handleAccept = async () => {
    try {
      setIsAccepting(true);

      // Use the API to add the suggested step
      await ChatApiService.addSuggestedStep(role, suggestion);

      // Set this sequence as active
      const sequences = useHelixStore.getState().sequences;
      const sequence = sequences.find((seq) => seq.role === role);
      if (sequence) {
        setActiveSequence(sequence.id);
      }

      // Dismiss the suggestion
      setIsDismissed(true);
      if (onDismissed) onDismissed();
    } catch (error) {
      console.error("Error accepting suggestion:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismissed) onDismissed();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-4 border-primary/20 bg-primary/5">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
        <div className="flex-1">
          <AlertDescription className="text-foreground">
            <p className="mb-2">
              <strong>Suggestion:</strong> Add a {suggestion.channel} step to
              your {role} sequence
              {suggestion.delay > 0 ? ` after ${suggestion.delay} days` : ""}.
            </p>
            {suggestion.content && (
              <p className="text-sm text-muted-foreground mb-2">
                {suggestion.content}
              </p>
            )}
            <div className="flex space-x-2 mt-3">
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={isAccepting}
                className="bg-primary hover:bg-primary/90"
              >
                {isAccepting ? (
                  "Adding..."
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add to Sequence
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="border-border"
              >
                <X className="h-4 w-4 mr-1" />
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
