import type { DownloadJob } from "~/types/music";

export const useQueueStore = defineStore("queue", () => {
    const api = useApi();

    const jobs = ref<DownloadJob[]>([]);
    const inspectedJob = ref<DownloadJob | null>(null);
    const loading = ref(false);
    const error = ref("");
    let pollInterval: any = null;

    function startPolling() {
        if (!import.meta.client || pollInterval) return;
        pollInterval = setInterval(async () => {
            const hasActiveJobs = jobs.value.some((j: DownloadJob) => ['processing', 'fetching', 'queued'].includes(j.status) && !j.control?.paused);
            if (!hasActiveJobs) return;

            try {
                const response = await api.listDownloads();
                jobs.value = response.data;
                if (inspectedJob.value) {
                    const updated = jobs.value.find((j: DownloadJob) => j.id === inspectedJob.value?.id);
                    if (updated) inspectedJob.value = updated;
                }
            } catch (e) {
                console.warn("Queue poll failed", e);
            }
        }, 1500);
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    async function refresh() {
        loading.value = true;
        error.value = "";
        try {
            const response = await api.listDownloads();
            jobs.value = response.data;
            if (!inspectedJob.value && jobs.value.length) {
                inspectedJob.value = jobs.value[0];
            }
        } catch (e: any) {
            console.warn("Queue refresh failed, using mock data");
            jobs.value = getMockJobs();
            error.value = e?.data?.error ?? e?.message ?? "Failed to load queue";
        } finally {
            loading.value = false;
        }
    }

    function getMockJobs(): DownloadJob[] {
        return [
            { id: "mock-job-1", status: "processing", progress: 64, url: "https://tidal.com/browse/album/123", message: "Fetching metadata...", createdAt: Date.now() - 100000, updatedAt: Date.now(), startedAt: Date.now() - 100000, finishedAt: null },
            { id: "mock-job-2", status: "queued", progress: 0, url: "https://spotify.com/album/456", message: "In queuepos: 2", createdAt: Date.now() - 50000, updatedAt: Date.now(), startedAt: null, finishedAt: null },
            { id: "mock-job-3", status: "completed", progress: 100, url: "https://deezer.com/album/789", message: "Saved to library", createdAt: Date.now() - 200000, updatedAt: Date.now(), startedAt: Date.now() - 150000, finishedAt: Date.now() - 10000 },
        ];
    }

    function applyUpdate(updated: DownloadJob) {
        if (inspectedJob.value?.id === updated.id) inspectedJob.value = updated;
        jobs.value = jobs.value.map((job: DownloadJob) => (job.id === updated.id ? updated : job));
    }

    function inspect(job: DownloadJob) {
        inspectedJob.value = job;
    }

    async function handleAction(job: DownloadJob, action: "pause" | "resume" | "retry" | "cancel") {
        error.value = "";
        try {
            let response;
            if (action === "pause") response = await api.pauseDownload(job.id);
            if (action === "resume") response = await api.resumeDownload(job.id);
            if (action === "retry") response = await api.retryDownload(job.id);
            if (action === "cancel") response = await api.cancelDownload(job.id);
            if (response?.data) { applyUpdate(response.data); await refresh(); }
        } catch (e: any) {
            error.value = e?.data?.error ?? e?.message ?? "Action failed";
        }
    }

    async function startDownload(url: string, options: Record<string, unknown>) {
        const response = await api.startDownload(url, options);
        jobs.value.unshift(response.data);
        inspectedJob.value = response.data;
        startPolling();
        return response;
    }

    if (import.meta.client) {
        refresh();
        startPolling();
    }

    return { jobs, inspectedJob, loading, error, refresh, inspect, handleAction, applyUpdate, startDownload, startPolling, stopPolling };
});
