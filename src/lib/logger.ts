type ErrorContext = Record<string, unknown>;

const isDev = typeof window !== "undefined"
  ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  : process.env.NODE_ENV === "development";

export const logger = {
  error: (message: string, error?: unknown, context?: ErrorContext) => {
    const entry = {
      message,
      error: error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error,
      context,
      timestamp: new Date().toISOString(),
    };

    if (isDev) {
      console.error(`[HIMO] ${message}`, error || "", context || "");
    }

    try {
      const stored = JSON.parse(sessionStorage.getItem("himo_errors") || "[]");
      stored.push(entry);
      if (stored.length > 50) stored.shift();
      sessionStorage.setItem("himo_errors", JSON.stringify(stored));
    } catch {
      // sessionStorage may be full or unavailable
    }
  },

  api: {
    supabase: (operation: string, error: unknown, details?: ErrorContext) => {
      logger.error(`Supabase ${operation} failed`, error, details);
    },
    groq: (operation: string, error: unknown, details?: ErrorContext) => {
      logger.error(`Groq API ${operation} failed`, error, details);
    },
  },

  getRecent: (): ErrorEntry[] => {
    try {
      return JSON.parse(sessionStorage.getItem("himo_errors") || "[]");
    } catch {
      return [];
    }
  },

  clear: () => {
    try {
      sessionStorage.removeItem("himo_errors");
    } catch {
      // ignore
    }
  },
};

interface ErrorEntry {
  message: string;
  error?: unknown;
  context?: ErrorContext;
  timestamp: string;
}
