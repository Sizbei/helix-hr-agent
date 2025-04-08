"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useHelixStore from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { ApiService } from "@/lib/api";
import { toast } from "sonner";

export function EmptyState() {
  const [isCreating, setIsCreating] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSequence, sessionId } = useHelixStore();

  const handleCreateSequence = async () => {
    if (roleName.trim()) {
      try {
        setIsSubmitting(true);

        // Call API to create a new sequence
        await ApiService.createSequence(sessionId, roleName.trim());

        // Update local state
        addSequence(roleName.trim());
        setRoleName("");
        setIsCreating(false);
        toast.success(`Sequence created for ${roleName.trim()}`);
      } catch (error) {
        console.error("Error creating sequence:", error);
        toast.error("Failed to create sequence");

        // Still update local state for development if API fails
        addSequence(roleName.trim());
        setRoleName("");
        setIsCreating(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && roleName.trim()) {
      handleCreateSequence();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {isCreating ? (
        <div className="w-full max-w-md space-y-4">
          <h3 className="text-xl font-medium text-foreground">
            Create Your First Sequence
          </h3>
          <p className="text-muted-foreground">
            Enter a role name to start creating your outreach sequence.
          </p>
          <div className="space-y-2">
            <Input
              placeholder="Role name (e.g. Software Engineer)"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-input border-input-border text-input-foreground"
              disabled={isSubmitting}
            />
            <div className="flex space-x-2">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleCreateSequence}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Sequence"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="border-border"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6">
          <Card className="bg-muted/50 border-border">
            <CardContent className="p-6">
              <MessageSquarePlus className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                No Sequences Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by creating a new sequence or ask Helix to help you craft
                one for a specific role.
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Create Your First Sequence
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <h4 className="font-medium text-foreground mb-2">
                Try asking Helix:
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  • &quot;Create a recruiting sequence for Software
                  Engineers&quot;
                </li>
                <li>
                  • &quot;Help me craft outreach for Product Managers&quot;
                </li>
                <li>• &quot;Design messages for Senior UX Designers&quot;</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
