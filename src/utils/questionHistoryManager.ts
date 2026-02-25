/**
 * Question History Manager
 * ────────────────────────
 * Tracks questions asked across the last N interviews so the AI
 * (and the fallback shuffler) can avoid repetition.
 *
 * Storage key: "superapp_question_history"
 * Shape: QuestionHistoryEntry[]  (most-recent-first)
 */

const STORAGE_KEY = "superapp_question_history";
const MAX_INTERVIEWS = 5; // keep last 5 interviews

export interface QuestionHistoryEntry {
    interviewId: string;
    templateType: string;
    timestamp: string;
    questions: string[]; // raw question text
}

function load(): QuestionHistoryEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as QuestionHistoryEntry[];
    } catch {
        return [];
    }
}

function save(entries: QuestionHistoryEntry[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
        console.warn("[QuestionHistory] Failed to persist to localStorage");
    }
}

/**
 * Record a new interview's questions.
 * Auto-prunes to keep only the last MAX_INTERVIEWS.
 */
function recordInterview(
    interviewId: string,
    templateType: string,
    questions: string[]
): void {
    const entries = load();
    entries.unshift({
        interviewId,
        templateType,
        timestamp: new Date().toISOString(),
        questions,
    });
    // keep only last N
    save(entries.slice(0, MAX_INTERVIEWS));
}

/**
 * Get recently asked questions for a given template type.
 * Returns a flat string list of questions from the last N interviews
 * matching the given template (or all if templateType is omitted).
 */
function getRecentQuestions(templateType?: string): string[] {
    const entries = load();
    const filtered = templateType
        ? entries.filter((e) => e.templateType === templateType)
        : entries;
    const all: string[] = [];
    for (const entry of filtered) {
        all.push(...entry.questions);
    }
    return [...new Set(all)]; // deduplicate
}

/**
 * Build a prompt-ready "avoid" block for the AI.
 * Returns an empty string if there's no history.
 */
function getAvoidancePrompt(templateType?: string): string {
    const recent = getRecentQuestions(templateType);
    if (recent.length === 0) return "";

    return `\n\nIMPORTANT — QUESTION FRESHNESS:
The candidate has been asked these questions recently. Do NOT repeat them unless absolutely necessary. Generate fresh, different questions that build on the same themes but explore new angles:
${recent.map((q, i) => `${i + 1}. "${q}"`).join("\n")}
`;
}

/**
 * Shuffle an array of questions, deprioritizing ones that appear in
 * the recent history. Questions NOT in history come first (shuffled),
 * followed by those that ARE in history (shuffled).
 */
function shuffleWithDeprioritization<
    T extends { question: string }
>(questions: T[], templateType?: string): T[] {
    const recent = new Set(
        getRecentQuestions(templateType).map((q) => q.toLowerCase().trim())
    );

    const fresh: T[] = [];
    const repeated: T[] = [];

    for (const q of questions) {
        if (recent.has(q.question.toLowerCase().trim())) {
            repeated.push(q);
        } else {
            fresh.push(q);
        }
    }

    // Fisher-Yates shuffle
    const shuffle = <U>(arr: U[]): U[] => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    return [...shuffle(fresh), ...shuffle(repeated)];
}

/**
 * Clear all question history (e.g. for testing or reset).
 */
function clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export const questionHistoryManager = {
    recordInterview,
    getRecentQuestions,
    getAvoidancePrompt,
    shuffleWithDeprioritization,
    clearHistory,
};
