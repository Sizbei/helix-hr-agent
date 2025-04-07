"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SequenceStep as SequenceStepComponent } from "@/components/SequenceStep";
import { EmptyState } from "@/components/EmptyState";
import useHelixStore from "@/lib/store";
import { useState } from "react";

export function Workspace() {
  const { sequences, activeSequenceId, setActiveSequence, addSequence } =
    useHelixStore();
  const [isCreatingSequence, setIsCreatingSequence] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const handleAddSequence = () => {
    if (newRoleName.trim()) {
      addSequence(newRoleName.trim());
      setNewRoleName("");
      setIsCreatingSequence(false);
    }
  };

  return (
    <div className="w-3/5 h-full flex flex-col bg-white">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Workspace</h2>

        {sequences.length > 0 && !isCreatingSequence && (
          <Button
            onClick={() => setIsCreatingSequence(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Sequence
          </Button>
        )}
      </div>

      {isCreatingSequence ? (
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-medium mb-2">Create New Sequence</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter role name (e.g. Software Engineer)"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAddSequence}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Create
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingSequence(false);
                setNewRoleName("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {sequences.length === 0 ? (
        <EmptyState />
      ) : (
        <Tabs
          value={activeSequenceId || sequences[0]?.id}
          onValueChange={setActiveSequence}
          className="flex-1 flex flex-col"
        >
          <div className="border-b border-slate-200">
            <TabsList className="h-12 bg-slate-50 pl-4 pr-4 rounded-none">
              {sequences.map((sequence) => (
                <TabsTrigger
                  key={sequence.id}
                  value={sequence.id}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
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
              {sequence.steps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <p className="mb-4">No steps in this sequence yet</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
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
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
