"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import useHelixStore from "@/lib/store";

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function MemoryDebugButton() {
  const { sessionId } = useHelixStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [memoryData, setMemoryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemoryData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/debug/memory/${sessionId}`);
      setMemoryData(response.data);
    } catch (err) {
      console.error("Error fetching memory data:", err);
      setError("Failed to fetch memory data. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = async () => {
    setIsDialogOpen(true);
    await fetchMemoryData();
  };

  const formatState = (state: any) => {
    if (!state) return "No state data available";

    return Object.entries(state).map(([key, value]) => (
      <div key={key} className="mb-1">
        <strong>{key}:</strong> {JSON.stringify(value)}
      </div>
    ));
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
        className="absolute top-4 right-4 z-10"
      >
        <Database className="h-4 w-4 mr-1" />
        Debug Memory
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Memory Debug - Session: {sessionId}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {isLoading && (
            <div className="py-4 text-center">Loading memory data...</div>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="p-4 text-destructive">
                {error}
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && memoryData && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">State Data</h3>
                  <div className="text-sm overflow-x-auto">
                    {formatState(memoryData.state)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">
                    Memory - {memoryData.memory.message_count} Messages
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {memoryData.memory.messages.map((msg: any, idx: number) => (
                      <div key={idx} className="border p-2 rounded-md text-sm">
                        <div className="font-bold">{msg.type}</div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={fetchMemoryData} disabled={isLoading}>
                  Refresh Data
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
