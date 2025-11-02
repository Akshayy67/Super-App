import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { realTimeAuth } from "./realTimeAuth";
import { firestoreUserTasks } from "./firestoreUserTasks";
import { studySessionService } from "./studySessionService";
import { journalService } from "./journalService";
import { storageUtils } from "./storage";
import { driveStorageUtils } from "./driveStorage";
import { unifiedAIService } from "./aiConfig";
import { isSameDay, format, startOfDay, endOfDay } from "date-fns";

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  type: "todo" | "meeting" | "study_session" | "event" | "reminder" | "journal" | "note" | "file" | "flashcard";
  relatedId?: string; // ID of related todo, meeting, study session, journal, note, file, or flashcard
  color?: string;
  allDay?: boolean;
  reminders?: Array<{
    time: Date;
    enabled: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DateSummary {
  date: Date;
  todos: number;
  completedTodos: number;
  journals: number;
  notes: number;
  files: number;
  flashcards: number;
  summary: string;
  highlights: string[];
}

export interface MeetingRequest {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  participants?: string[];
  location?: string;
  meetingLink?: string;
}

class CalendarService {
  private getEventsCollection(userId: string) {
    return collection(db, "users", userId, "calendarEvents");
  }

  async createEvent(eventData: Omit<CalendarEvent, "id" | "userId" | "createdAt" | "updatedAt">): Promise<CalendarEvent> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const event: Omit<CalendarEvent, "id"> = {
      ...eventData,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(this.getEventsCollection(user.id), {
      ...event,
      startDate: Timestamp.fromDate(event.startDate),
      endDate: event.endDate ? Timestamp.fromDate(event.endDate) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ...event,
      id: docRef.id,
    };
  }

  async getEvents(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CalendarEvent[]> {
    const eventsCollection = this.getEventsCollection(userId);
    let q = query(eventsCollection, orderBy("startDate", "asc"));

    if (startDate || endDate) {
      const conditions = [];
      if (startDate) {
        conditions.push(where("startDate", ">=", Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        conditions.push(where("startDate", "<=", Timestamp.fromDate(endDate)));
      }
      q = query(eventsCollection, ...conditions, orderBy("startDate", "asc"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        ...data,
        id: docSnapshot.id,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        reminders: data.reminders?.map((r: any) => ({
          ...r,
          time: r.time?.toDate() || new Date(),
        })),
      } as CalendarEvent;
    });
  }

  async updateEvent(
    userId: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> {
    const updatesToApply: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.startDate) {
      updatesToApply.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.endDate) {
      updatesToApply.endDate = Timestamp.fromDate(updates.endDate);
    }

    await updateDoc(doc(this.getEventsCollection(userId), eventId), updatesToApply);
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    await deleteDoc(doc(this.getEventsCollection(userId), eventId));
  }

  async syncTodosToCalendar(userId: string): Promise<void> {
    const tasks = await firestoreUserTasks.getTasks(userId);
    const existingEvents = await this.getEvents(userId);

    for (const task of tasks) {
      if (task.status === "pending" && task.dueDate) {
        const existingEvent = existingEvents.find(
          (e) => e.type === "todo" && e.relatedId === task.id
        );

        const eventData: Omit<CalendarEvent, "id" | "userId" | "createdAt" | "updatedAt"> = {
          title: task.title,
          description: task.description || `Subject: ${task.subject}`,
          startDate: new Date(task.dueDate),
          type: "todo",
          relatedId: task.id,
          color: task.priority === "high" ? "#ef4444" : task.priority === "medium" ? "#f59e0b" : "#10b981",
          allDay: false,
        };

        if (existingEvent) {
          await this.updateEvent(userId, existingEvent.id, eventData);
        } else {
          await this.createEvent(eventData);
        }
      }
    }

    // Remove calendar events for completed or deleted tasks
    for (const event of existingEvents) {
      if (event.type === "todo" && event.relatedId) {
        const task = tasks.find((t) => t.id === event.relatedId);
        if (!task || task.status === "completed") {
          await this.deleteEvent(userId, event.id);
        }
      }
    }
  }

  async syncJournalsToCalendar(userId: string): Promise<void> {
    const journals = await journalService.getJournalEntries(userId);
    const existingEvents = await this.getEvents(userId);

    for (const journal of journals) {
      const journalDate = journal.date;
      const existingEvent = existingEvents.find(
        (e) => e.type === "journal" && e.relatedId === journal.id
      );

      const eventData: Omit<CalendarEvent, "id" | "userId" | "createdAt" | "updatedAt"> = {
        title: "Journal Entry",
        description: journal.content.substring(0, 200) + (journal.content.length > 200 ? "..." : ""),
        startDate: journalDate,
        type: "journal",
        relatedId: journal.id,
        color: "#8b5cf6",
        allDay: true,
      };

      if (existingEvent) {
        await this.updateEvent(userId, existingEvent.id, eventData);
      } else {
        await this.createEvent(eventData);
      }
    }

    // Remove calendar events for deleted journals
    for (const event of existingEvents) {
      if (event.type === "journal" && event.relatedId) {
        const journal = journals.find((j) => j.id === event.relatedId);
        if (!journal) {
          await this.deleteEvent(userId, event.id);
        }
      }
    }
  }

  async syncNotesToCalendar(userId: string): Promise<void> {
    const notes = storageUtils.getShortNotes(userId);
    const existingEvents = await this.getEvents(userId);

    for (const note of notes) {
      const noteDate = new Date(note.createdAt);
      const existingEvent = existingEvents.find(
        (e) => e.type === "note" && e.relatedId === note.id
      );

      const eventData: Omit<CalendarEvent, "id" | "userId" | "createdAt" | "updatedAt"> = {
        title: note.title || "Short Note",
        description: note.content.substring(0, 200) + (note.content.length > 200 ? "..." : ""),
        startDate: noteDate,
        type: "note",
        relatedId: note.id,
        color: "#f59e0b",
        allDay: true,
      };

      if (existingEvent) {
        await this.updateEvent(userId, existingEvent.id, eventData);
      } else {
        await this.createEvent(eventData);
      }
    }

    // Remove calendar events for deleted notes
    for (const event of existingEvents) {
      if (event.type === "note" && event.relatedId) {
        const note = notes.find((n) => n.id === event.relatedId);
        if (!note) {
          await this.deleteEvent(userId, event.id);
        }
      }
    }
  }

  async syncFilesToCalendar(userId: string): Promise<void> {
    const files = await driveStorageUtils.getFiles(userId);
    const existingEvents = await this.getEvents(userId);

    for (const file of files) {
      if (file.type === "file") {
        const fileDate = new Date(file.uploadedAt);
        const existingEvent = existingEvents.find(
          (e) => e.type === "file" && e.relatedId === file.id
        );

        const eventData: Omit<CalendarEvent, "id" | "userId" | "createdAt" | "updatedAt"> = {
          title: `📄 ${file.name}`,
          description: `File uploaded: ${file.name}`,
          startDate: fileDate,
          type: "file",
          relatedId: file.id,
          color: "#06b6d4",
          allDay: true,
        };

        if (existingEvent) {
          await this.updateEvent(userId, existingEvent.id, eventData);
        } else {
          await this.createEvent(eventData);
        }
      }
    }

    // Remove calendar events for deleted files
    for (const event of existingEvents) {
      if (event.type === "file" && event.relatedId) {
        const file = files.find((f) => f.id === event.relatedId);
        if (!file) {
          await this.deleteEvent(userId, event.id);
        }
      }
    }
  }

  async syncFlashcardsToCalendar(userId: string): Promise<void> {
    const flashcards = await driveStorageUtils.loadFlashcardsFromDrive(userId);
    const existingEvents = await this.getEvents(userId);

    // Group flashcards by creation date
    const flashcardsByDate = new Map<string, any[]>();

    for (const card of flashcards) {
      if (card.createdAt) {
        const cardDate = new Date(card.createdAt);
        const dateKey = format(cardDate, "yyyy-MM-dd");
        if (!flashcardsByDate.has(dateKey)) {
          flashcardsByDate.set(dateKey, []);
        }
        flashcardsByDate.get(dateKey)!.push(card);
      }
    }

    // Create calendar events for each date with flashcards
    for (const [dateKey, cards] of flashcardsByDate.entries()) {
      const cardDate = new Date(dateKey);
      const eventId = `flashcard_${dateKey}`;
      const existingEvent = existingEvents.find(
        (e) => e.type === "flashcard" && format(e.startDate, "yyyy-MM-dd") === dateKey
      );

      const eventData: Omit<CalendarEvent, "id" | "userId" | "createdAt" | "updatedAt"> = {
        title: `📚 ${cards.length} Flashcard${cards.length > 1 ? "s" : ""} Created`,
        description: `${cards.length} flashcard${cards.length > 1 ? "s were" : " was"} created on this day`,
        startDate: cardDate,
        type: "flashcard",
        relatedId: cards.map((c) => c.id).join(","),
        color: "#10b981",
        allDay: true,
      };

      if (existingEvent) {
        await this.updateEvent(userId, existingEvent.id, eventData);
      } else {
        await this.createEvent(eventData);
      }
    }

    // Remove calendar events for dates with no flashcards
    const flashcardEvents = existingEvents.filter((e) => e.type === "flashcard");
    for (const event of flashcardEvents) {
      const eventDateKey = format(event.startDate, "yyyy-MM-dd");
      if (!flashcardsByDate.has(eventDateKey)) {
        await this.deleteEvent(userId, event.id);
      }
    }
  }

  async syncAllItemsToCalendar(userId: string): Promise<void> {
    await Promise.all([
      this.syncTodosToCalendar(userId),
      this.syncJournalsToCalendar(userId),
      this.syncNotesToCalendar(userId),
      this.syncFilesToCalendar(userId),
      this.syncFlashcardsToCalendar(userId),
    ]);
  }

  async generateDateSummary(userId: string, date: Date): Promise<DateSummary> {
    const startOfSelectedDay = startOfDay(date);
    const endOfSelectedDay = endOfDay(date);

    // Get all items for the selected date
    const tasks = await firestoreUserTasks.getTasks(userId);
    const dayTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = startOfDay(new Date(task.dueDate));
      return isSameDay(taskDate, startOfSelectedDay);
    });

    const journals = await journalService.getJournalEntries(userId, startOfSelectedDay, endOfSelectedDay);
    const notes = storageUtils.getShortNotes(userId).filter((note) => {
      const noteDate = startOfDay(new Date(note.createdAt));
      return isSameDay(noteDate, startOfSelectedDay);
    });

    const files = (await driveStorageUtils.getFiles(userId)).filter((file) => {
      if (file.type !== "file") return false;
      const fileDate = startOfDay(new Date(file.uploadedAt));
      return isSameDay(fileDate, startOfSelectedDay);
    });

    const flashcards = (await driveStorageUtils.loadFlashcardsFromDrive(userId)).filter((card) => {
      if (!card.createdAt) return false;
      const cardDate = startOfDay(new Date(card.createdAt));
      return isSameDay(cardDate, startOfSelectedDay);
    });

    const completedTodos = dayTasks.filter((task) => task.status === "completed").length;

    // Build context for AI summary
    const context = {
      date: format(date, "EEEE, MMMM d, yyyy"),
      todos: dayTasks.map((t) => `${t.title} (${t.status})`).join(", "),
      completedTodos,
      journals: journals.map((j) => j.content.substring(0, 100)).join(" | "),
      notes: notes.map((n) => n.title || n.content.substring(0, 50)).join(", "),
      files: files.map((f) => f.name).join(", "),
      flashcardsCount: flashcards.length,
    };

    // Generate AI summary
    const summaryPrompt = `Summarize what happened on ${context.date}:

Tasks: ${context.todos || "None"}
Completed Tasks: ${context.completedTodos}
Journal Entries: ${journals.length > 0 ? journals.length + " entry(ies)" : "None"}
Short Notes: ${notes.length > 0 ? notes.length + " note(s)" : "None"}
Files Uploaded: ${files.length > 0 ? files.length + " file(s)" : "None"}
Flashcards Created: ${flashcards.length > 0 ? flashcards.length + " flashcard(s)" : "None"}

Please provide a concise, engaging summary of this day's activities, highlighting accomplishments and key activities. Keep it under 150 words.`;

    let aiSummary = "";
    let highlights: string[] = [];

    try {
      const summaryResponse = await unifiedAIService.generateResponse(summaryPrompt);
      if (summaryResponse.success && summaryResponse.data) {
        aiSummary = summaryResponse.data;
        // Extract highlights from summary
        highlights = [
          `${dayTasks.length} task${dayTasks.length !== 1 ? "s" : ""} (${completedTodos} completed)`,
          `${journals.length} journal entr${journals.length !== 1 ? "ies" : "y"}`,
          `${notes.length} note${notes.length !== 1 ? "s" : ""}`,
          `${files.length} file${files.length !== 1 ? "s" : ""} uploaded`,
          `${flashcards.length} flashcard${flashcards.length !== 1 ? "s" : ""} created`,
        ].filter((h) => !h.includes("0"));
      }
    } catch (error) {
      console.error("Error generating AI summary:", error);
      aiSummary = `On ${format(date, "MMMM d, yyyy")}, you had ${dayTasks.length} tasks (${completedTodos} completed), wrote ${journals.length} journal ${journals.length !== 1 ? "entries" : "entry"}, created ${notes.length} note${notes.length !== 1 ? "s" : ""}, uploaded ${files.length} file${files.length !== 1 ? "s" : ""}, and created ${flashcards.length} flashcard${flashcards.length !== 1 ? "s" : ""}.`;
    }

    return {
      date,
      todos: dayTasks.length,
      completedTodos,
      journals: journals.length,
      notes: notes.length,
      files: files.length,
      flashcards: flashcards.length,
      summary: aiSummary || `Summary for ${format(date, "MMMM d, yyyy")}`,
      highlights: highlights.length > 0 ? highlights : ["No activities recorded"],
    };
  }

  async scheduleMeeting(meeting: MeetingRequest): Promise<CalendarEvent> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const event = await this.createEvent({
      title: meeting.title,
      description: meeting.description || "",
      startDate: meeting.startTime,
      endDate: meeting.endTime,
      type: "meeting",
      color: "#3b82f6",
      allDay: false,
    });

    // If meeting link is provided, add it to description
    if (meeting.meetingLink) {
      await this.updateEvent(user.id, event.id, {
        description: `${meeting.description || ""}\n\nMeeting Link: ${meeting.meetingLink}`,
      });
    }

    return event;
  }

  async getUpcomingEvents(userId: string, days: number = 7): Promise<CalendarEvent[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.getEvents(userId, startDate, endDate);
  }

  async getEventsForDate(userId: string, date: Date): Promise<CalendarEvent[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getEvents(userId, startOfDay, endOfDay);
  }
}

export const calendarService = new CalendarService();

