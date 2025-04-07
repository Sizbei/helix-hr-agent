"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SequenceStep as SequenceStepComponent } from "@/components/SequenceStep";
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
    <div className="w-3/5 h-full flex flex-col bg-zinc-900">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-100">Workspace</h2>

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
        <div className="p-4 border-b border-zinc-800 bg-zinc-800">
          <h3 className="text-sm font-medium mb-2 text-zinc-300">
            Create New Sequence
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter role name (e.g. Software Engineer)"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="flex-1 bg-zinc-700 border-zinc-600 text-zinc-100"
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
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {sequences.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-zinc-400">
          <div className="text-center max-w-md">
            <h3 className="text-xl font-medium mb-2 text-zinc-300">
              RESEARCHING...
            </h3>
            <p className="mb-6">
              Start by creating a sequence for a specific role
            </p>
            <Button
              onClick={() => setIsCreatingSequence(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Sequence
            </Button>
          </div>
        </div>
      ) : (
        <Tabs
          value={activeSequenceId || sequences[0]?.id}
          onValueChange={setActiveSequence}
          className="flex-1 flex flex-col"
        >
          <div className="border-b border-zinc-800">
            <TabsList className="h-12 bg-zinc-800 px-4 rounded-none">
              {sequences.map((sequence) => (
                <TabsTrigger
                  key={sequence.id}
                  value={sequence.id}
                  className="data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none text-zinc-400"
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
                <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                  <p className="mb-4">No steps in this sequence yet</p>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
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
