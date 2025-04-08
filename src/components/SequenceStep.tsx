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

  const { updateSequenceStep, removeSequenceStep } = useHelixStore();

  const handleSaveChanges = () => {
    updateSequenceStep(sequenceId, step.id, editedStep);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedStep(step);
    setIsEditing(false);
  };

  const handleRemoveStep = () => {
    if (confirm("Are you sure you want to remove this step?")) {
      removeSequenceStep(sequenceId, step.id);
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
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveStep}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
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
