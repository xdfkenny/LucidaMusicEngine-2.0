import type { DownloadJob, SearchResult, LibraryArtist, EnrichedMetadata, AlbumDetail } from "~/types/music";

export function useApi() {
  const config = useRuntimeConfig();
  const base = config.public.apiBase;

  async function search(query: string): Promise<SearchResult[]> {
    const data = await $fetch<{ success: boolean; results: SearchResult[] }>(`${base}/api/search`, {
      query: { q: query },
    });

    return data.results ?? [];
  }

  async function searchBaka(query: string, service?: string): Promise<SearchResult[]> {
    const data = await $fetch<{ success: boolean; results: SearchResult[] }>(`${base}/api/search/baka`, {
      query: { q: query, service },
    });

    return data.results ?? [];
  }

  async function startDownload(url: string, options: Record<string, unknown>) {
    return $fetch<{ success: boolean; downloadId: string; data: DownloadJob }>(`${base}/api/downloads`, {
      method: "POST",
      body: { url, options },
    });
  }

  async function getDownload(id: string) {
    return $fetch<{ success: boolean; data: DownloadJob }>(`${base}/api/downloads/${id}`);
  }

  async function listDownloads() {
    return $fetch<{ success: boolean; data: DownloadJob[] }>(`${base}/api/downloads`);
  }

  async function pauseDownload(id: string) {
    return $fetch<{ success: boolean; data: DownloadJob }>(`${base}/api/downloads/${id}/pause`, {
      method: "POST",
    });
  }

  async function resumeDownload(id: string) {
    return $fetch<{ success: boolean; data: DownloadJob }>(`${base}/api/downloads/${id}/resume`, {
      method: "POST",
    });
  }

  async function cancelDownload(id: string) {
    return $fetch<{ success: boolean; data: DownloadJob }>(`${base}/api/downloads/${id}/cancel`, {
      method: "POST",
    });
  }

  async function retryDownload(id: string) {
    return $fetch<{ success: boolean; data: DownloadJob }>(`${base}/api/downloads/${id}/retry`, {
      method: "POST",
    });
  }

  async function listDownloadedFiles() {
    return $fetch<{ success: boolean; data: LibraryArtist[] }>(`${base}/api/files`);
  }

  async function getAlbumDetail(artist: string, album: string) {
    return $fetch<{ success: boolean; data: AlbumDetail }>(`${base}/api/files/album`, {
      query: { artist, album },
    });
  }

  async function enrichMetadata(payload: { title?: string; artist?: string; album?: string; url?: string }) {
    return $fetch<{ success: boolean; data: EnrichedMetadata }>(`${base}/api/metadata/enrich`, {
      method: "POST",
      body: payload,
    });
  }

  function coverUrl(artist: string, album: string) {
    return `${base}/api/files/cover?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}`;
  }

  return {
    search,
    searchBaka,
    startDownload,
    getDownload,
    listDownloads,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    retryDownload,
    listDownloadedFiles,
    getAlbumDetail,
    enrichMetadata,
    coverUrl,
  };
}
