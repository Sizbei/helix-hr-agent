"use client";

import { useState, useEffect } from "react";
import {
  User,
  LogOut,
  Upload,
  Download,
  Trash2,
  FileText,
  ArrowRight,
  Save,
  Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useSession } from "@/lib/session";
import { toast } from "sonner";
import { format } from "date-fns";

export function UserSettings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [userEmail, setUserEmail] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const {
    sessionId,
    userIdentifier,
    registerEmail,
    exportSession,
    importSession,
    deleteSession,
    getUserSessions,
    recoverSession,
  } = useSession();

  // Load user email from session on mount
  useEffect(() => {
    if (userIdentifier) {
      setUserEmail(userIdentifier);
    }
  }, [userIdentifier]);

  // Register email
  const handleSaveUserInfo = async () => {
    if (userEmail && userEmail.includes("@")) {
      try {
        setIsLoading(true);
        await registerEmail(userEmail);
        toast.success("Email registered successfully!");
        loadUserSessions();
      } catch (error) {
        console.error("Error registering email:", error);
        toast.error("Failed to register email");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  // Load user sessions by email
  const loadUserSessions = async () => {
    if (!userEmail || !userEmail.includes("@")) {
      return;
    }

    try {
      setIsLoading(true);
      const sessions = await getUserSessions(userEmail);

      // Ensure sessions is an array
      if (Array.isArray(sessions)) {
        setUserSessions(sessions);
      } else {
        console.warn("Expected array of sessions but got:", sessions);
        setUserSessions([]);
      }
    } catch (error) {
      console.error("Error loading user sessions:", error);
      toast.error("Failed to load your sessions");
      setUserSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Recover sessions by email
  const handleRecoverSession = async () => {
    if (!recoveryEmail || !recoveryEmail.includes("@")) {
      toast.error("Please enter a valid recovery email");
      return;
    }

    try {
      setIsLoading(true);
      const sessions = await getUserSessions(recoveryEmail);

      // Ensure sessions is an array
      if (Array.isArray(sessions) && sessions.length > 0) {
        setUserSessions(sessions);
        setActiveTab("sessions");
        toast.success("Found sessions associated with your email");
      } else {
        toast.info("No sessions found for this email");
        setUserSessions([]);
      }
    } catch (error) {
      console.error("Error recovering sessions:", error);
      toast.error("Failed to recover sessions");
      setUserSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to a specific session
  const handleSwitchSession = async (targetSessionId: string) => {
    try {
      setIsLoading(true);

      // Use the email we already have
      const email = userEmail || recoveryEmail;

      if (!email) {
        toast.error("Email is required to switch sessions");
        return;
      }

      const success = await recoverSession(email, targetSessionId);

      if (success) {
        toast.success("Session switched successfully");
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to switch to selected session");
      }
    } catch (error) {
      console.error("Error switching session:", error);
      toast.error("Failed to switch session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      const exportData = await exportSession();

      // Create a JSON file for download
      const blob = new Blob([JSON.stringify(exportData)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      // Create download link and trigger click
      const a = document.createElement("a");
      a.href = url;
      a.download = `helix-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = () => {
    // Create file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e: any) => {
      if (!e.target.files.length) return;

      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          setIsLoading(true);
          const importData = JSON.parse(event?.target?.result as string);
          await importSession(importData);
          toast.success("Data imported successfully");
          setIsDialogOpen(false);
        } catch (error) {
          console.error("Error importing data:", error);
          toast.error("Failed to import data");
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await deleteSession();
      toast.success("Session data deleted successfully");
      setShowConfirmDelete(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session data");
    } finally {
      setIsLoading(false);
    }
  };

  // Format session date for display
  const formatSessionDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="gap-2"
      >
        <User className="h-4 w-4" />
        {userIdentifier ? userIdentifier : "Account"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">User Settings</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="data">Import/Export</TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="py-4 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Current Session ID</h3>
                <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded-md overflow-x-auto">
                  {sessionId}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">
                  Register Email (for session recovery)
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Your email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveUserInfo} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Registering your email allows you to recover your sessions
                  from different devices.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <h3 className="font-semibold text-sm">
                  Recover Sessions by Email
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your email to recover sessions"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleRecoverSession}
                    disabled={isLoading}
                    variant="outline"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Recover
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Retrieve all sessions associated with your email.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  variant="destructive"
                  onClick={() => setShowConfirmDelete(true)}
                  className="w-full"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Current Session Data
                </Button>
              </div>

              {showConfirmDelete && (
                <Card className="border-destructive">
                  <CardContent className="pt-6 pb-4">
                    <h4 className="font-bold mb-2">Confirm Deletion</h4>
                    <p className="text-sm mb-4">
                      This will permanently delete all sequences and messages in
                      your current session. This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowConfirmDelete(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                      >
                        {isLoading ? "Deleting..." : "Delete Everything"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="py-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Your Sessions</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadUserSessions}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {userSessions.length > 0 ? (
                <div className="space-y-3">
                  {userSessions.map((session) => (
                    <Card
                      key={session.sessionId}
                      className={
                        session.sessionId === sessionId ? "border-primary" : ""
                      }
                    >
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium flex justify-between">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-primary" />
                            <span>
                              {session.sessionId === sessionId
                                ? "Current Session"
                                : `Session from ${formatSessionDate(
                                    session.lastActivity
                                  )}`}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {session.sequenceCount} sequences
                          </span>
                        </CardTitle>
                      </CardHeader>

                      {session.sessionId !== sessionId && (
                        <CardFooter className="py-2 px-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSwitchSession(session.sessionId)
                            }
                            disabled={isLoading}
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Switch to this session
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {isLoading
                    ? "Loading your sessions..."
                    : "No sessions found. Register your email in the Account tab to track your sessions."}
                </div>
              )}
            </TabsContent>

            {/* Data Import/Export Tab */}
            <TabsContent value="data" className="py-4 space-y-4">
              <h3 className="font-semibold mb-2">Import/Export Your Data</h3>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Download className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium">Export Your Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Export all your sequences and messages to a JSON file
                        that you can save as a backup or import into another
                        session.
                      </p>
                      <Button
                        onClick={handleExportData}
                        className="mt-2"
                        disabled={isLoading}
                      >
                        {isLoading ? "Exporting..." : "Export Data"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Upload className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium">Import Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Import sequences and messages from a previously exported
                        JSON file. This will merge the imported data with your
                        current session.
                      </p>
                      <Button
                        onClick={handleImportData}
                        variant="outline"
                        className="mt-2"
                        disabled={isLoading}
                      >
                        {isLoading ? "Importing..." : "Import Data"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
