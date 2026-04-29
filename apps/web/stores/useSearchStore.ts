import type { SearchResult, DownloadJob } from "~/types/music";

export const useSearchStore = defineStore("search", () => {
    const api = useApi();

    const query = ref("");
    const isSearching = ref(false);
    const results = ref<SearchResult[]>([]);
    const selectedResult = ref<SearchResult | null>(null);
    const error = ref("");

    const filters = reactive({
        source: "All" as "All" | "Lucida" | "Tidal" | "Spotify" | "Baka",
        quality: "Any" as "Any" | "FLAC" | "MP3",
        type: "Album" as "Album" | "Artist" | "Track",
    });

    const profiles = [
        {
            id: "flac",
            label: "FLAC",
            tag: "FLAC",
            description: "Lossless, full metadata.",
            options: { metadata: true, forceDownload: false, groupSingles: true, flattenDirectories: false, skipTracks: false, skipCover: false, albumYear: "append" },
        },
        {
            id: "mp3",
            label: "MP3",
            tag: "MP3",
            description: "Compact, simplified folders.",
            options: { metadata: true, forceDownload: false, groupSingles: false, flattenDirectories: true, skipTracks: false, skipCover: false, albumYear: "" },
        },
        {
            id: "metadata",
            label: "Metadata Only",
            tag: "META",
            description: "Enriched tags, cover art only.",
            options: { metadata: true, forceDownload: false, groupSingles: true, flattenDirectories: false, skipTracks: false, skipCover: false, albumYear: "prepend" },
        },
    ] as const;

    const activeProfileId = ref<string>(profiles[0].id);

    const activeProfile = computed(() => profiles.find((p) => p.id === activeProfileId.value) ?? profiles[0]);

    const downloadOptions = reactive({
        country: "US",
        metadata: true,
        forceDownload: false,
        groupSingles: true,
        flattenDirectories: false,
        albumYear: "append" as string,
        skipTracks: false,
        skipCover: false,
        baka: false,
    });

    function applyProfile(id: string) {
        const profile = profiles.find((p) => p.id === id);
        if (!profile) return;
        activeProfileId.value = id;
        Object.assign(downloadOptions, profile.options);
    }

    function getMockResults(q: string): SearchResult[] {
        return [
            { title: `${q} Original Mix`, artist: "Lucida Artist", album: "Refactored Sounds", cover: "https://picsum.photos/300/300?1", url: "mock-1", source: "lucida" },
            { title: "Cinematic Atmosphere", artist: "Studio Pro", album: "Workstation 2.0", cover: "https://picsum.photos/300/300?2", url: "mock-2", source: "tidal" },
            { title: "Lossless Symphony", artist: "Hifi Master", album: "FLAC Collections", cover: "https://picsum.photos/300/300?3", url: "mock-3", source: "deezer" },
            { title: "Bitrate Ascension", artist: "Waveform", album: "Digital Pulse", cover: "https://picsum.photos/300/300?4", url: "mock-4", source: "qobuz" },
        ];
    }

    async function runSearch() {
        error.value = "";
        if (!query.value.trim()) { error.value = "Enter a search term"; return; }
        isSearching.value = true;
        try {
            if (filters.source === "Baka") {
                results.value = await api.searchBaka(query.value.trim(), "soundcloud");
                downloadOptions.baka = true;
            } else {
                results.value = await api.search(query.value.trim());
                downloadOptions.baka = false;
            }
        } catch (e: any) {
            console.error("Search failed:", e);
            error.value = e?.data?.error ?? e?.message ?? "Search failed";
            // Do not silently fallback to mock data; keep results empty so UI can show the error.
            results.value = [];
        } finally {
            isSearching.value = false;
        }
    }

    function selectResult(item: SearchResult) {
        selectedResult.value = item;
    }

    return { query, isSearching, results, selectedResult, error, filters, profiles, activeProfileId, activeProfile, downloadOptions, applyProfile, runSearch, selectResult };
});
