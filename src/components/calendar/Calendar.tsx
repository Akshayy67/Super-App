import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Users,
  Bell,
  Plus,
  Filter,
  RefreshCw,
  BookOpen,
  FileText,
  Brain,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react";
import { calendarService, type CalendarEvent, type DateSummary } from "../../utils/calendarService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { firestoreUserTasks } from "../../utils/firestoreUserTasks";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfDay, endOfDay, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [filter, setFilter] = useState<"all" | "todo" | "meeting" | "study_session" | "event" | "reminder" | "journal" | "note" | "file" | "flashcard">("all");
  const [loading, setLoading] = useState(true);
  const [showDateDetail, setShowDateDetail] = useState(false);
  const [dateSummary, setDateSummary] = useState<DateSummary | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [remainingTasksCount, setRemainingTasksCount] = useState<number>(0);
  const navigate = useNavigate();

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, currentDate]);

  const loadEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      
      // Sync all items to calendar first
      await calendarService.syncAllItemsToCalendar(user.id);
      
      // Then load events
      const loadedEvents = await calendarService.getEvents(user.id, startDate, endDate);
      setEvents(loadedEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = async (date: Date) => {
    setSelectedDate(date);
    setShowDateDetail(true);
    setDateSummary(null);
    await loadRemainingTasksCount(date);
  };

  const loadRemainingTasksCount = async (date: Date) => {
    if (!user) return;
    try {
      const tasks = await firestoreUserTasks.getTasks(user.id);
      
      // Filter tasks that are due on this date and not completed
      const remainingTasks = tasks.filter((task) => {
        if (!task.dueDate || task.status === "completed") return false;
        const taskDate = new Date(task.dueDate);
        return isSameDay(taskDate, date);
      });
      
      setRemainingTasksCount(remainingTasks.length);
    } catch (error) {
      console.error("Error loading remaining tasks count:", error);
      setRemainingTasksCount(0);
    }
  };

  const loadDateSummary = async (date: Date) => {
    if (!user) return;
    setGeneratingSummary(true);
    try {
      const summary = await calendarService.generateDateSummary(user.id, date);
      setDateSummary(summary);
    } catch (error) {
      console.error("Error loading date summary:", error);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (!event.relatedId) return;

    // Navigate to the appropriate page based on event type
    switch (event.type) {
      case "todo":
        navigate(`/tasks`);
        break;
      case "journal":
        navigate(`/journal`);
        break;
      case "note":
        navigate(`/notes`);
        break;
      case "file":
        navigate(`/files`);
        break;
      case "flashcard":
        navigate(`/flashcards`);
        break;
      default:
        break;
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const filteredEvents = getFilteredEvents();
    return filteredEvents.filter((event) => {
      if (event.allDay) {
        return isSameDay(event.startDate, date);
      }
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getFilteredEvents = (): CalendarEvent[] => {
    if (filter === "all") return events;
    return events.filter((event) => event.type === filter);
  };

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "todo":
        return <CheckCircle2 className="w-3 h-3" />;
      case "meeting":
        return <Users className="w-3 h-3" />;
      case "study_session":
        return <Clock className="w-3 h-3" />;
      case "reminder":
        return <Bell className="w-3 h-3" />;
      case "journal":
        return <BookOpen className="w-3 h-3" />;
      case "note":
        return <FileText className="w-3 h-3" />;
      case "file":
        return <FileText className="w-3 h-3" />;
      case "flashcard":
        return <Brain className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const getEventColor = (event: CalendarEvent): string => {
    return event.color || "#3b82f6";
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            Calendar
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {format(currentDate, "MMMM yyyy")}
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Today
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Events</option>
            <option value="todo">Todos</option>
            <option value="meeting">Meetings</option>
            <option value="study_session">Study Sessions</option>
            <option value="event">Events</option>
            <option value="reminder">Reminders</option>
            <option value="journal">Journals</option>
            <option value="note">Notes</option>
            <option value="file">Files</option>
            <option value="flashcard">Flashcards</option>
          </select>
          <button
            onClick={() => loadEvents()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
            title="Refresh Calendar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Month View */}
      {view === "month" && (
        <>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-base font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 flex-1">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <div
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  className={`min-h-[80px] p-1 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer transition-colors ${
                    !isCurrentMonth
                      ? "bg-gray-50 dark:bg-slate-800/50 opacity-50"
                      : "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                  } ${isToday ? "ring-2 ring-blue-500" : ""} ${
                    isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={`text-lg font-bold ${
                        isToday
                          ? "text-blue-600 dark:text-blue-400"
                          : isCurrentMonth
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    {!isCurrentMonth && (
                      <div className="text-xs font-medium text-gray-400 dark:text-gray-600">
                        {format(day, "MMM")}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-1 text-xs px-1 py-0.5 rounded truncate"
                        style={{
                          backgroundColor: `${getEventColor(event)}20`,
                          color: getEventColor(event),
                        }}
                      >
                        {getEventIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Date Detail Modal */}
      {showDateDetail && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {format(selectedDate, "EEEE")}
                </h3>
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  {format(selectedDate, "MMMM d, yyyy")}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDateDetail(false);
                  setSelectedDate(null);
                  setDateSummary(null);
                  setRemainingTasksCount(0);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Remaining Tasks and Days Count */}
              {(() => {
                const today = startOfDay(new Date());
                const daysDiff = selectedDate ? differenceInDays(selectedDate, today) : 0;
                const isPast = daysDiff < 0;
                const isToday = daysDiff === 0;
                const daysDisplay = isPast ? Math.abs(daysDiff) : daysDiff;
                
                return (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Remaining Tasks */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
                        <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                          {remainingTasksCount}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                          Tasks Remaining
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                          Incomplete tasks due
                        </p>
                      </div>
                    </div>

                    {/* Days Remaining */}
                    <div className={`p-4 rounded-lg border ${
                      isPast
                        ? "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700"
                        : isToday
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700"
                        : "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700"
                    }`}>
                      <div className="flex flex-col items-center">
                        <CalendarIcon className={`w-8 h-8 mb-2 ${
                          isPast
                            ? "text-red-600 dark:text-red-400"
                            : isToday
                            ? "text-green-600 dark:text-green-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`} />
                        <div className={`text-4xl font-bold mb-1 ${
                          isPast
                            ? "text-red-600 dark:text-red-400"
                            : isToday
                            ? "text-green-600 dark:text-green-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}>
                          {daysDisplay}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {isPast ? "Days Ago" : isToday ? "Today" : "Days Remaining"}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                          {isToday ? "This is today" : isPast ? "Past date" : "Until this date"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Summary Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Daily Summary
                  </h4>
                  <button
                    onClick={() => loadDateSummary(selectedDate)}
                    disabled={generatingSummary}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {generatingSummary ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Summary
                      </>
                    )}
                  </button>
                </div>
                {dateSummary ? (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{dateSummary.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {dateSummary.highlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Click "Generate Summary" to create an AI-powered summary of this day
                  </p>
                )}
              </div>

              {/* Events Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Activities ({selectedDateEvents.length})
                </h4>
                {selectedDateEvents.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No activities on this day</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer group"
                        style={{
                          borderLeftColor: getEventColor(event),
                          borderLeftWidth: "4px",
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getEventIcon(event.type)}
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {event.title}
                              </h4>
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                                style={{
                                  backgroundColor: `${getEventColor(event)}20`,
                                  color: getEventColor(event),
                                }}
                              >
                                {event.type.replace("_", " ")}
                              </span>
                              <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {event.description}
                              </p>
                            )}
                            {!event.allDay && (
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {format(event.startDate, "h:mm a")}
                                  {event.endDate && ` - ${format(event.endDate, "h:mm a")}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

