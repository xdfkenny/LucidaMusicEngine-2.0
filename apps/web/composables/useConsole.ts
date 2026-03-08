import { computed } from "vue";

export interface ConsoleLog {
  id: number;
  ts: number;
  type: string;
  category: string;
  level: string;
  message: string;
  data?: any;
}

const MAX_LOGS = 2000;
let eventSource: EventSource | null = null;

function safeParse(data: string) {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function useConsole() {
  const config = useRuntimeConfig();
  const base = config.public.apiBase;
  const logs = useState<ConsoleLog[]>("console-logs", () => []);
  const paused = useState<boolean>("console-paused", () => false);
  const pausedBuffer = useState<ConsoleLog[]>("console-paused-buffer", () => []);
  const filter = useState<string>("console-filter", () => "All");
  const search = useState<string>("console-search", () => "");
  const autoScroll = useState<boolean>("console-autoscroll", () => true);
  const expanded = useState<boolean>("console-expanded", () => false);
  const connectionState = useState<string>("console-connection", () => "connecting");
  const status = useState<{ backend: string; scraper: string; queue: string }>("console-status", () => ({
    backend: "Offline",
    scraper: "Unknown",
    queue: "0 jobs",
  }));

  const filters = ["All", "API", "Scraper", "Downloads", "Metadata", "Errors", "System"];

  const filteredLogs = computed(() => {
    const term = search.value.trim().toLowerCase();
    return logs.value.filter((log) => {
      if (filter.value !== "All" && log.category !== filter.value) return false;
      if (!term) return true;
      const haystack = `${log.message} ${log.type} ${JSON.stringify(log.data ?? {})}`.toLowerCase();
      return haystack.includes(term);
    });
  });

  function pushLog(entry: ConsoleLog) {
    if (paused.value) {
      pausedBuffer.value.push(entry);
      if (pausedBuffer.value.length > MAX_LOGS) {
        pausedBuffer.value.splice(0, pausedBuffer.value.length - MAX_LOGS);
      }
      return;
    }

    logs.value.push(entry);
    if (logs.value.length > MAX_LOGS) {
      logs.value.splice(0, logs.value.length - MAX_LOGS);
    }
  }

  function flushPaused() {
    if (!pausedBuffer.value.length) return;
    const buffer = [...pausedBuffer.value];
    pausedBuffer.value = [];
    buffer.forEach((entry) => pushLog(entry));
  }

  function connect() {
    if (eventSource) return;
    const url = `${base}/api/console/stream`;
    eventSource = new EventSource(url);

    eventSource.addEventListener("init", (event) => {
      const payload = safeParse((event as MessageEvent).data);
      if (payload?.logs) {
        logs.value = payload.logs.slice(-MAX_LOGS);
      }
    });

    eventSource.addEventListener("log", (event) => {
      const payload = safeParse((event as MessageEvent).data);
      if (!payload) return;
      pushLog(payload);
      if (payload.type === "SYSTEM_STATUS" && payload.data) {
        status.value = {
          backend: payload.data.backend ?? "Online",
          scraper: payload.data.scraper ?? "Unknown",
          queue: payload.data.queue ?? "0 jobs",
        };
      }
    });

    eventSource.onerror = () => {
      connectionState.value = "closed";
    };

    eventSource.onopen = () => {
      connectionState.value = "open";
    };
  }

  function togglePause() {
    paused.value = !paused.value;
    if (!paused.value) {
      flushPaused();
    }
  }

  function clear() {
    logs.value = [];
    pausedBuffer.value = [];
  }

  function setFilter(value: string) {
    filter.value = value;
  }

  function setSearch(value: string) {
    search.value = value;
  }

  function toggleExpanded() {
    expanded.value = !expanded.value;
  }

  if (process.client) {
    connect();
  }

  return {
    logs,
    filteredLogs,
    filters,
    filter,
    search,
    paused,
    autoScroll,
    expanded,
    status,
    connectionState,
    pushLog,
    togglePause,
    clear,
    setFilter,
    setSearch,
    toggleExpanded,
  };
}
