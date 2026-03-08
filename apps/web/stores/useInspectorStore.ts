import type { SearchResult, DownloadJob } from "~/types/music";

export type InspectorMode = "result" | "job" | null;

export const useInspectorStore = defineStore("inspector", () => {
    const open = ref(false);
    const mode = ref<InspectorMode>(null);
    const result = ref<SearchResult | null>(null);
    const job = ref<DownloadJob | null>(null);

    function inspectResult(item: SearchResult) {
        result.value = item;
        job.value = null;
        mode.value = "result";
        open.value = true;
    }

    function inspectJob(item: DownloadJob) {
        job.value = item;
        result.value = null;
        mode.value = "job";
        open.value = true;
    }

    function close() {
        open.value = false;
        setTimeout(() => { mode.value = null; result.value = null; job.value = null; }, 300);
    }

    return { open, mode, result, job, inspectResult, inspectJob, close };
});
