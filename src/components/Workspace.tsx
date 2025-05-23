"use client";

import { useState } from "react";
import { PlusCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SequenceStep as SequenceStepComponent } from "@/components/SequenceStep";
import useHelixStore from "@/lib/store";
import { StepType } from "@/lib/store";
import { ApiService } from "@/lib/api";
import { toast } from "sonner";

export function Workspace() {
  const {
    sequences,
    activeSequenceId,
    setActiveSequence,
    addSequence,
    addSequenceStep,
    sessionId,
  } = useHelixStore();

  const [isCreatingSequence, setIsCreatingSequence] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepType, setNewStepType] = useState<StepType>("email");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSequence = async () => {
    if (newRoleName.trim()) {
      try {
        setIsSubmitting(true);

        // Check if a sequence with this role already exists
        const exists = sequences.some(
          (seq) => seq.role.toLowerCase() === newRoleName.trim().toLowerCase()
        );

        if (exists) {
          // Just switch to the existing sequence
          const existingSequence = sequences.find(
            (seq) => seq.role.toLowerCase() === newRoleName.trim().toLowerCase()
          );
          if (existingSequence) {
            setActiveSequence(existingSequence.id);
            toast.info(
              `Switched to existing sequence for ${newRoleName.trim()}`
            );
          }
        } else {
          // Call API to create sequence
          const response = await ApiService.createSequence(
            sessionId,
            newRoleName.trim()
          );

          // Only add locally if API call succeeded
          if (response && response.success) {
            addSequence(newRoleName.trim());
            toast.success(`Sequence created for ${newRoleName.trim()}`);
          }
        }

        setNewRoleName("");
        setIsCreatingSequence(false);
      } catch (error) {
        console.error("Error creating sequence:", error);
        toast.error("Failed to create sequence");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddStep = async () => {
    if (activeSequenceId) {
      const activeSequence = sequences.find(
        (seq) => seq.id === activeSequenceId
      );

      if (activeSequence) {
        try {
          setIsSubmitting(true);

          const stepData = {
            stepType: newStepType,
            subject: newStepType === "email" ? "Subject line" : undefined,
            body: "",
            delay: activeSequence.steps.length > 0 ? 1 : 0,
            order: activeSequence.steps.length,
          };

          // Call API to add step - use the proper property names for the API
          await ApiService.addSequenceStep(sessionId, activeSequenceId, {
            stepType: stepData.stepType,
            subject: stepData.subject,
            body: stepData.body,
            delay: stepData.delay,
            order: stepData.order,
          });

          // Update local state
          addSequenceStep(activeSequenceId, stepData);
          setIsAddingStep(false);
          toast.success("Step added successfully");
        } catch (error) {
          console.error("Error adding step:", error);
          toast.error("Failed to add step");

          // Still update local state for development if API fails
          addSequenceStep(activeSequenceId, {
            stepType: newStepType,
            subject: newStepType === "email" ? "Subject line" : undefined,
            body: "",
            delay: activeSequence.steps.length > 0 ? 1 : 0,
            order: activeSequence.steps.length,
          });
          setIsAddingStep(false);
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  // Comment out or remove the unused function
  /*
  const handleDeleteSequence = async (sequenceId: string) => {
    try {
      await ApiService.deleteSequence(sessionId, sequenceId);
      removeSequence(sequenceId);
      toast.success("Sequence deleted successfully");
    } catch (error) {
      console.error("Error deleting sequence:", error);
      toast.error("Failed to delete sequence");
      
      // Still update local state for development if API fails
      removeSequence(sequenceId);
    }
  };
  */

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newRoleName.trim()) {
      handleAddSequence();
    }
  };

  // Fallback if no sequences are available
  if (sequences.length === 0) {
    return (
      <div className="w-3/5 h-full flex flex-col items-center justify-center overflow-y-auto">
        <p className="text-muted-foreground">No sequences available</p>
        <Button
          onClick={() => setIsCreatingSequence(true)}
          className="mt-4 bg-primary hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Sequence
        </Button>
      </div>
    );
  }

  return (
    <div className="w-3/5 h-full flex flex-col bg-background">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Workspace</h2>

        {!isCreatingSequence && (
          <Button
            onClick={() => setIsCreatingSequence(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Sequence
          </Button>
        )}
      </div>

      {isCreatingSequence ? (
        <div className="p-4 border-b border-border bg-muted">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">
            Create New Sequence
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter role name (e.g. Software Engineer)"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-input border-input-border text-input-foreground"
              disabled={isSubmitting}
            />
            <Button
              onClick={handleAddSequence}
              className="bg-secondary hover:bg-secondary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingSequence(false);
                setNewRoleName("");
              }}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <Tabs
        value={activeSequenceId || sequences[0]?.id}
        onValueChange={setActiveSequence}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="border-b border-border">
          <TabsList className="h-12 bg-muted px-4 rounded-4px">
            {sequences.map((sequence) => (
              <TabsTrigger
                key={sequence.id}
                value={sequence.id}
                className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-4px text-muted-foreground"
              >
                {sequence.role}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {sequences.map((sequence) => (
          <TabsContent
            key={sequence.id}
            value={sequence.id}
            className="flex-1 p-4 overflow-y-auto space-y-4 mt-0"
          >
            {isAddingStep && sequence.id === activeSequenceId ? (
              <div className="p-4 mb-4 border border-border rounded-md bg-muted">
                <h3 className="text-sm font-medium mb-3 text-foreground">
                  Add New Step
                </h3>
                <div className="flex flex-col space-y-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={newStepType === "email" ? "default" : "outline"}
                      className={newStepType === "email" ? "bg-primary" : ""}
                      onClick={() => setNewStepType("email")}
                      disabled={isSubmitting}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        newStepType === "linkedin" ? "default" : "outline"
                      }
                      className={newStepType === "linkedin" ? "bg-primary" : ""}
                      onClick={() => setNewStepType("linkedin")}
                      disabled={isSubmitting}
                    >
                      <svg
                        className="h-4 w-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                      LinkedIn
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAddStep}
                      className="bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add Step"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingStep(false)}
                      className="border-border"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {sequence.steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                <p className="mb-4">No steps in this sequence yet</p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    setActiveSequence(sequence.id);
                    setIsAddingStep(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add First Step
                </Button>
              </div>
            ) : (
              <>
                {sequence.steps.map((step, index) => (
                  <SequenceStepComponent
                    key={step.id}
                    step={step}
                    sequenceId={sequence.id}
                    stepNumber={index + 1}
                  />
                ))}

                <div className="flex justify-center py-4">
                  <Button
                    onClick={() => {
                      setActiveSequence(sequence.id);
                      setIsAddingStep(true);
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Another Step
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
