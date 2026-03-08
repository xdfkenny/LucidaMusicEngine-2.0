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
let logIdCounter = 0;

function safeParse(data: string) {
    try { return JSON.parse(data); } catch { return null; }
}

export const useConsoleStore = defineStore("console", () => {
    const config = useRuntimeConfig();
    const base = config.public.apiBase;

    const logs = ref<ConsoleLog[]>([]);
    const paused = ref(false);
    const pausedBuffer = ref<ConsoleLog[]>([]);
    const filter = ref("All");
    const search = ref("");
    const autoScroll = ref(true);
    const drawerOpen = ref(false);
    const connectionState = ref("connecting");
    const status = ref({ backend: "Offline", scraper: "Unknown", queue: "0 jobs" });

    const LOG_TYPES = ["All", "API_REQUEST", "API_RESPONSE", "SCRAPER_EVENT", "DOWNLOAD_PROGRESS", "DOWNLOAD_COMPLETE", "ERROR"];

    const filteredLogs = computed(() => {
        const term = search.value.trim().toLowerCase();
        return logs.value.filter((log) => {
            if (filter.value !== "All" && log.type !== filter.value) return false;
            if (!term) return true;
            return `${log.message} ${log.type} ${JSON.stringify(log.data ?? {})}`.toLowerCase().includes(term);
        });
    });

    const latestLog = computed(() => logs.value[logs.value.length - 1] ?? null);

    function pushLog(entry: ConsoleLog) {
        if (paused.value) {
            pausedBuffer.value.push(entry);
            if (pausedBuffer.value.length > MAX_LOGS) pausedBuffer.value.splice(0, pausedBuffer.value.length - MAX_LOGS);
            return;
        }
        logs.value.push(entry);
        if (logs.value.length > MAX_LOGS) logs.value.splice(0, logs.value.length - MAX_LOGS);
    }

    function flushPaused() {
        if (!pausedBuffer.value.length) return;
        const buf = [...pausedBuffer.value];
        pausedBuffer.value = [];
        buf.forEach(pushLog);
    }

    function connect() {
        if (eventSource) return;
        const url = `${base}/api/console/stream`;
        eventSource = new EventSource(url);

        eventSource.addEventListener("init", (e) => {
            const payload = safeParse((e as MessageEvent).data);
            if (payload?.logs) logs.value = payload.logs.slice(-MAX_LOGS);
        });

        eventSource.addEventListener("log", (e) => {
            const payload = safeParse((e as MessageEvent).data);
            if (!payload) return;
            pushLog({ ...payload, id: ++logIdCounter });
            if (payload.type === "SYSTEM_STATUS" && payload.data) {
                status.value = {
                    backend: payload.data.backend ?? "Online",
                    scraper: payload.data.scraper ?? "Unknown",
                    queue: payload.data.queue ?? "0 jobs",
                };
            }
        });

        eventSource.onerror = () => { connectionState.value = "closed"; };
        eventSource.onopen = () => { connectionState.value = "open"; };
    }

    function togglePause() {
        paused.value = !paused.value;
        if (!paused.value) flushPaused();
    }

    function clear() { logs.value = []; pausedBuffer.value = []; }

    function setFilter(v: string) { filter.value = v; }
    function toggleDrawer() { drawerOpen.value = !drawerOpen.value; }

    if (import.meta.client) { connect(); }

    return {
        logs, filteredLogs, latestLog, filter, search, paused, autoScroll,
        drawerOpen, connectionState, status, LOG_TYPES,
        pushLog, togglePause, clear, setFilter, toggleDrawer,
    };
});
