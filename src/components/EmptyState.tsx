"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useHelixStore from "@/lib/store";

export function EmptyState() {
  const [isCreating, setIsCreating] = useState(false);
  const [roleName, setRoleName] = useState("");
  const { addSequence } = useHelixStore();

  const handleCreateSequence = () => {
    if (roleName.trim()) {
      addSequence(roleName);
      setRoleName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {isCreating ? (
        <div className="w-full max-w-md space-y-4">
          <h3 className="text-xl font-medium text-slate-800">
            Create Your First Sequence
          </h3>
          <p className="text-slate-500">
            Enter a role name to start creating your outreach sequence.
          </p>
          <div className="space-y-2">
            <Input
              placeholder="Role name (e.g. Software Engineer)"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateSequence}
              >
                Create Sequence
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <MessageSquarePlus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-800 mb-2">
              No Sequences Yet
            </h3>
            <p className="text-slate-600 mb-4">
              Start by creating a new sequence or ask Helix to help you craft
              one for a specific role.
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Sequence
            </Button>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h4 className="font-medium text-slate-800 mb-2">
              Try asking Helix:
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                • &quot;Write a recruiting sequence for Software Engineers&quot;
              </li>
              <li>
                • &quot;Create a sales outreach for Product Managers&quot;
              </li>
              <li>• &quot;Help me craft messages for Senior Designers&quot;</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
