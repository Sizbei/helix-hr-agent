"use client";

import { useState } from "react";
import { Edit, Save, Trash2, Clock, Mail, Linkedin } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SequenceStep as StepType } from "@/lib/store";
import useHelixStore from "@/lib/store";
import { ApiService } from "@/lib/api";
import { toast } from "sonner";

interface SequenceStepProps {
  step: StepType;
  sequenceId: string;
  stepNumber: number;
}

export function SequenceStep({
  step,
  sequenceId,
  stepNumber,
}: SequenceStepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStep, setEditedStep] = useState<StepType>(step);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { updateSequenceStep, removeSequenceStep, sessionId } = useHelixStore();

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      // Create an object with the correct property names for the API
      const updates = {
        stepType: editedStep.stepType,
        subject: editedStep.subject,
        body: editedStep.body,
        delay: editedStep.delay,
        order: editedStep.order,
      };

      // Call API to update step
      await ApiService.updateSequenceStep(
        sessionId,
        sequenceId,
        step.id,
        updates
      );

      // Update local state
      updateSequenceStep(sequenceId, step.id, editedStep);
      setIsEditing(false);
      toast.success("Step updated successfully");
    } catch (error) {
      console.error("Error updating step:", error);
      toast.error("Failed to update step");

      // Still update local state for development if API fails
      updateSequenceStep(sequenceId, step.id, editedStep);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedStep(step);
    setIsEditing(false);
  };

  const handleRemoveStep = async () => {
    if (confirm("Are you sure you want to remove this step?")) {
      try {
        setIsDeleting(true);

        // Call API to delete step
        await ApiService.deleteSequenceStep(sessionId, sequenceId, step.id);

        // Update local state
        removeSequenceStep(sequenceId, step.id);
        toast.success("Step removed successfully");
      } catch (error) {
        console.error("Error removing step:", error);
        toast.error("Failed to remove step");

        // Still update local state for development if API fails
        removeSequenceStep(sequenceId, step.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-muted border-b">
        <div className="flex items-center space-x-2">
          {step.stepType === "email" ? (
            <Mail className="h-4 w-4 text-primary" />
          ) : (
            <Linkedin className="h-4 w-4 text-primary" />
          )}
          <CardTitle className="text-sm font-medium">
            Step {stepNumber}:{" "}
            {step.stepType === "email" ? "Email" : "LinkedIn Message"}
          </CardTitle>
        </div>

        {step.delay > 0 && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              Send after {step.delay} day{step.delay > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {isEditing ? (
          <>
            {step.stepType === "email" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={editedStep.subject || ""}
                  onChange={(e) =>
                    setEditedStep({ ...editedStep, subject: e.target.value })
                  }
                  placeholder="Email subject line"
                  className="bg-input border-input-border text-input-foreground"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={editedStep.body}
                onChange={(e) =>
                  setEditedStep({ ...editedStep, body: e.target.value })
                }
                placeholder="Write your message here..."
                rows={5}
                className="bg-input border-input-border text-input-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Delay (days)</label>
              <Input
                type="number"
                min="0"
                value={editedStep.delay}
                onChange={(e) =>
                  setEditedStep({
                    ...editedStep,
                    delay: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-input border-input-border text-input-foreground"
              />
            </div>
          </>
        ) : (
          <>
            {step.stepType === "email" && step.subject && (
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Subject</h4>
                <p className="text-foreground">{step.subject}</p>
              </div>
            )}

            <div className="space-y-1">
              <h4 className="font-medium text-sm">Message</h4>
              <div className="p-3 bg-muted rounded-md whitespace-pre-wrap text-foreground">
                {step.body}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 border-t bg-muted flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveStep}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive/90"
            >
              {isDeleting ? (
                "Removing..."
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
