import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Calendar, CheckCircle2, Users, Mail, X, Plus, Tag } from "lucide-react";
import { journalService, type JournalEntry } from "../../utils/journalService";
import { dreamToPlanService } from "../../utils/dreamToPlanService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { format } from "date-fns";

export const JournalManager: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showDreamToPlan, setShowDreamToPlan] = useState(false);
  const [dreamToPlanResult, setDreamToPlanResult] = useState<any>(null);
  const [teamFormData, setTeamFormData] = useState<{ name: string; emails: string[]; currentEmail: string }>({
    name: "",
    emails: [],
    currentEmail: "",
  });
  const [meetingFormData, setMeetingFormData] = useState<{ [key: number]: { date: string; time: string } }>({});
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    try {
      const loadedEntries = await journalService.getJournalEntries(user.id);
      setEntries(loadedEntries);
    } catch (error) {
      console.error("Error loading entries:", error);
    }
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.trim() || !user) return;

    setLoading(true);
    try {
      await journalService.createJournalEntry({
        date: new Date(),
        content: currentEntry.trim(),
        mood: mood || undefined,
        tags: [],
      });

      setCurrentEntry("");
      setMood("");
      await loadEntries();
      alert("Journal entry saved successfully!");
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save journal entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDreamToPlan = async () => {
    if (!currentEntry.trim() || !user) return;

    setProcessing(true);
    try {
      const result = await dreamToPlanService.processJournalEntry(currentEntry.trim(), {
        autoCreateTodos: false, // Ask user first
        autoScheduleMeetings: false,
        autoCreateReminders: false,
      });

      setDreamToPlanResult(result);
      setShowDreamToPlan(true);
    } catch (error) {
      console.error("Error processing dream-to-plan:", error);
      alert("Failed to analyze journal entry. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleAcceptGoals = async () => {
    if (!dreamToPlanResult || !user) return;

    try {
      const hasTeamActions = dreamToPlanResult.actionItems?.some((item: any) => item.type === "team");
      
      // Only create team if team form was filled and submitted
      if (hasTeamActions && showTeamForm && teamFormData.name.trim()) {
        await handleCreateTeam();
      }

      // Always add todos and goals to calendar
      await dreamToPlanService.createTodosFromGoals(dreamToPlanResult.suggestedGoals);
      await dreamToPlanService.createTodosFromActions(
        dreamToPlanResult.actionItems.filter((item: any) => item.type === "todo")
      );
      
      // Handle meetings with date/time from form
      const meetingItems = dreamToPlanResult.actionItems
        .map((item: any, originalIdx: number) => {
          if (item.type === "meeting") {
            const formData = meetingFormData[originalIdx];
            if (formData && formData.date && formData.time) {
              const dateTime = new Date(`${formData.date}T${formData.time}`);
              return { ...item, suggestedDate: dateTime };
            }
          }
          return item;
        })
        .filter((item: any) => item.type === "meeting");
      await dreamToPlanService.scheduleMeetingsFromActions(meetingItems);
      
      await dreamToPlanService.createRemindersFromActions(
        dreamToPlanResult.actionItems.filter((item: any) => item.type === "reminder")
      );

      alert("✅ Done! All items have been added to your calendar.");
      setShowDreamToPlan(false);
      setDreamToPlanResult(null);
      setTeamFormData({ name: "", emails: [], currentEmail: "" });
      setMeetingFormData({});
      setShowTeamForm(false);
    } catch (error) {
      console.error("Error accepting goals:", error);
      alert("Failed to add items. Please try again.");
    }
  };

  const handleCreateTeam = async () => {
    if (!teamFormData.name.trim() || !user) return;

    setCreatingTeam(true);
    try {
      await dreamToPlanService.createTeamFromAction(
        teamFormData.name.trim(),
        "",
        teamFormData.emails
      );

      alert(`Team "${teamFormData.name}" created successfully! Invitations sent to ${teamFormData.emails.length} people.`);
      setTeamFormData({ name: "", emails: [], currentEmail: "" });
      setShowTeamForm(false);
      
      // Remove team action items from the result after creation
      if (dreamToPlanResult) {
        setDreamToPlanResult({
          ...dreamToPlanResult,
          actionItems: dreamToPlanResult.actionItems.filter((item: any) => item.type !== "team"),
        });
      }
    } catch (error) {
      console.error("Error creating team:", error);
      alert("Failed to create team. Please try again.");
    } finally {
      setCreatingTeam(false);
    }
  };

  const addEmail = () => {
    if (teamFormData.currentEmail.trim() && !teamFormData.emails.includes(teamFormData.currentEmail.trim())) {
      setTeamFormData({
        ...teamFormData,
        emails: [...teamFormData.emails, teamFormData.currentEmail.trim()],
        currentEmail: "",
      });
    }
  };

  const removeEmail = (email: string) => {
    setTeamFormData({
      ...teamFormData,
      emails: teamFormData.emails.filter((e) => e !== email),
    });
  };

  const todayEntry = entries.find((entry) => {
    const entryDate = new Date(entry.date);
    const today = new Date();
    return (
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Morning Journal
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Start your day by journaling your thoughts, dreams, and goals
          </p>
        </div>
      </div>

      {/* Dream-to-Plan Result Modal */}
      {showDreamToPlan && dreamToPlanResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Dream-to-Plan Analysis
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                I've analyzed your journal entry and extracted goals and action items
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Motivation Insights */}
              {dreamToPlanResult.motivationInsights && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Motivation Insights
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {dreamToPlanResult.motivationInsights}
                  </p>
                </div>
              )}

              {/* Themes Analysis */}
              {dreamToPlanResult.themes && dreamToPlanResult.themes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-cyan-600" />
                    Key Themes ({dreamToPlanResult.themes.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dreamToPlanResult.themes.map((theme: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {theme.name}
                          </h5>
                          <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 rounded-full text-xs font-medium">
                            {theme.confidence}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {theme.description}
                        </p>
                        {theme.tags && theme.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {theme.tags.map((tag: string, tagIdx: number) => (
                              <span
                                key={tagIdx}
                                className="px-2 py-1 bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 rounded text-xs border border-cyan-300 dark:border-cyan-700"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Goals */}
              {dreamToPlanResult.suggestedGoals?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Suggested Goals ({dreamToPlanResult.suggestedGoals.length})
                  </h4>
                  <div className="space-y-3">
                    {dreamToPlanResult.suggestedGoals.map((goal: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {goal.title}
                          </h5>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              goal.priority === "high"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : goal.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                          >
                            {goal.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {goal.description}
                        </p>
                        {goal.suggestedDueDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {format(new Date(goal.suggestedDueDate), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Creation Section - Only show if team actions detected */}
              {dreamToPlanResult.actionItems?.some((item: any) => item.type === "team") && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Create Team
                  </h4>
                  {dreamToPlanResult.actionItems
                    .filter((item: any) => item.type === "team")
                    .map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 mb-3"
                      >
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-3">{item.text}</p>
                        {!showTeamForm ? (
                          <button
                            onClick={() => {
                              setShowTeamForm(true);
                              setTeamFormData({
                                name: item.teamName || "",
                                emails: [],
                                currentEmail: "",
                              });
                            }}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Create Team & Send Invitations
                          </button>
                        ) : (
                          <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Team Name
                                  </label>
                                  <input
                                    type="text"
                                    value={teamFormData.name}
                                    onChange={(e) =>
                                      setTeamFormData({ ...teamFormData, name: e.target.value })
                                    }
                                    placeholder="Enter team name"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Team Description (Optional)
                                  </label>
                                  <textarea
                                    placeholder="Enter team description"
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Invite Members (Email Addresses)
                                  </label>
                                  <div className="flex gap-2 mb-2">
                                    <input
                                      type="email"
                                      value={teamFormData.currentEmail}
                                      onChange={(e) =>
                                        setTeamFormData({ ...teamFormData, currentEmail: e.target.value })
                                      }
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          addEmail();
                                        }
                                      }}
                                      placeholder="Enter email address"
                                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                    />
                                    <button
                                      onClick={addEmail}
                                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                  {teamFormData.emails.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {teamFormData.emails.map((email) => (
                                        <span
                                          key={email}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-sm"
                                        >
                                          <Mail className="w-3 h-3" />
                                          {email}
                                          <button
                                            onClick={() => removeEmail(email)}
                                            className="hover:text-red-600"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleCreateTeam}
                                    disabled={!teamFormData.name.trim() || creatingTeam}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                  >
                                    {creatingTeam ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Creating...
                                      </>
                                    ) : (
                                      <>
                                        <Users className="w-4 h-4" />
                                        Create Team & Send Invites
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setShowTeamForm(false)}
                                    className="px-4 py-2 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {/* Meeting Scheduling Section - Only show if meeting actions detected */}
              {dreamToPlanResult.actionItems?.some((item: any) => item.type === "meeting") && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Schedule Meeting
                  </h4>
                  <div className="space-y-3">
                    {dreamToPlanResult.actionItems
                      .filter((item: any) => item.type === "meeting")
                      .map((item: any, idx: number) => {
                        // Find original index in full array for form data
                        const originalIdx = dreamToPlanResult.actionItems.findIndex((i: any) => i === item);
                        return (
                          <div
                            key={idx}
                            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                          >
                            <p className="text-sm text-gray-900 dark:text-gray-100 mb-3">{item.text}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={meetingFormData[originalIdx]?.date || ""}
                                  onChange={(e) =>
                                    setMeetingFormData({
                                      ...meetingFormData,
                                      [originalIdx]: {
                                        ...meetingFormData[originalIdx],
                                        date: e.target.value,
                                        time: meetingFormData[originalIdx]?.time || "",
                                      },
                                    })
                                  }
                                  min={new Date().toISOString().split("T")[0]}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Time
                                </label>
                                <input
                                  type="time"
                                  value={meetingFormData[originalIdx]?.time || ""}
                                  onChange={(e) =>
                                    setMeetingFormData({
                                      ...meetingFormData,
                                      [originalIdx]: {
                                        ...meetingFormData[originalIdx],
                                        date: meetingFormData[originalIdx]?.date || "",
                                        time: e.target.value,
                                      },
                                    })
                                  }
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`meeting-todo-${idx}`}
                                defaultChecked
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <label htmlFor={`meeting-todo-${idx}`} className="text-xs text-gray-600 dark:text-gray-400">
                                Add todo reminder for this meeting
                              </label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Meeting will be added to calendar.
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Todo Tasks Section - Only show if todo actions detected */}
              {(dreamToPlanResult.actionItems?.some((item: any) => item.type === "todo") || dreamToPlanResult.suggestedGoals?.length > 0) && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Todo Tasks
                  </h4>
                  <div className="space-y-2">
                    {dreamToPlanResult.actionItems
                      ?.filter((item: any) => item.type === "todo")
                      .map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{item.text}</span>
                        </div>
                      ))}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      All todos will be added to your calendar and task list.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => {
                  setShowDreamToPlan(false);
                  setDreamToPlanResult(null);
                  setTeamFormData({ name: "", emails: [], currentEmail: "" });
                  setMeetingFormData({});
                  setShowTeamForm(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              {(() => {
                const hasTeamActions = dreamToPlanResult.actionItems?.some((item: any) => item.type === "team");
                const hasMeetingActions = dreamToPlanResult.actionItems?.some((item: any) => item.type === "meeting");
                const hasTodoActions = dreamToPlanResult.actionItems?.some((item: any) => item.type === "todo") || dreamToPlanResult.suggestedGoals?.length > 0;
                
                let buttonText = "Add to Calendar";
                if (hasTeamActions && !hasMeetingActions && !hasTodoActions) {
                  buttonText = "Create Team";
                } else if (hasMeetingActions && !hasTeamActions && !hasTodoActions) {
                  buttonText = "Schedule Meeting & Add to Calendar";
                } else if (hasTodoActions && !hasTeamActions && !hasMeetingActions) {
                  buttonText = "Add Todos & Calendar";
                } else {
                  buttonText = "Add All to Calendar";
                }

                return (
                  <button
                    onClick={handleAcceptGoals}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {buttonText}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Journal Entry Form */}
      <div className="flex-1 flex flex-col mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Today's Journal Entry
          </label>
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="Write your thoughts, dreams, goals, and plans for today..."
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mood (optional)
          </label>
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g., motivated, excited, focused..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveEntry}
            disabled={!currentEntry.trim() || loading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Save Entry
          </button>
          <button
            onClick={handleDreamToPlan}
            disabled={!currentEntry.trim() || processing}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Dream-to-Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Entries
        </h3>
        {entries.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No journal entries yet. Start by writing your first entry above!
          </p>
        ) : (
          <div className="space-y-4">
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {format(new Date(entry.date), "MMMM d, yyyy")}
                  </span>
                  {entry.mood && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs">
                      {entry.mood}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

