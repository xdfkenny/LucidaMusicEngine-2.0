import axios from "axios";
import { env } from "../../config/env.js";

const SPOTIFY_TOKEN_SKEW_MS = 60 * 1000;

function normalizeQuery(value) {
  return String(value ?? "").trim();
}

function toYear(dateString) {
  if (!dateString) return null;
  const year = Number(String(dateString).slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

function uniqueGenres(genres) {
  const set = new Set();
  for (const genre of genres ?? []) {
    if (genre) set.add(String(genre).trim());
  }
  return [...set];
}

export class MetadataService {
  constructor({ consoleService } = {}) {
    this.cache = new Map();
    this.cacheTtlMs = env.metadataCacheTtlMs;
    this.spotifyToken = null;
    this.spotifyTokenExpiresAt = 0;
    this.consoleService = consoleService ?? null;

    this.musicBrainzClient = axios.create({
      baseURL: "https://musicbrainz.org/ws/2",
      timeout: env.requestTimeoutMs,
      headers: {
        "User-Agent": env.metadataUserAgent,
        Accept: "application/json",
      },
    });

    this.lastFmClient = axios.create({
      baseURL: "https://ws.audioscrobbler.com/2.0/",
      timeout: env.requestTimeoutMs,
    });

    this.spotifyClient = axios.create({
      baseURL: "https://api.spotify.com/v1",
      timeout: env.requestTimeoutMs,
    });
  }

  emitConsole(event) {
    if (!this.consoleService) return;
    this.consoleService.emit(event);
  }

  readCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.cacheTtlMs) {
      this.cache.delete(key);
      return null;
    }
    return cached.value;
  }

  writeCache(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  mergeMetadata(target, result) {
    if (!result || result.status !== "ok" || !result.data) return;

    const data = result.data;
    target.title = target.title || data.title || null;
    target.artist = target.artist || data.artist || null;
    target.album = target.album || data.album || null;
    target.releaseYear = target.releaseYear ?? data.releaseYear ?? null;
    target.coverArtUrl = target.coverArtUrl || data.coverArtUrl || null;

    const mergedGenres = uniqueGenres([...(target.genres ?? []), ...(data.genres ?? [])]);
    target.genres = mergedGenres;
    target.sourceIds = { ...target.sourceIds, ...(data.sourceIds ?? {}) };
  }

  async enrich(payload) {
    const title = normalizeQuery(payload.title);
    const artist = normalizeQuery(payload.artist);
    const album = normalizeQuery(payload.album);
    const url = normalizeQuery(payload.url);

    const cacheKey = `${artist}|${title}|${album}|${url}`.toLowerCase();
    const cached = this.readCache(cacheKey);
    if (cached) {
      this.emitConsole({
        type: "METADATA_FETCH",
        category: "Metadata",
        level: "info",
        message: `Metadata cache hit for ${artist || "Unknown"} - ${album || title}`,
        data: { artist, album, title },
      });
      return cached;
    }

    this.emitConsole({
      type: "METADATA_FETCH",
      category: "Metadata",
      level: "info",
      message: `Metadata fetch started for ${artist || "Unknown"} - ${album || title}`,
      data: { artist, album, title },
    });

    const sources = [];
    const merged = {
      title: title || album || null,
      artist: artist || null,
      album: album || null,
      releaseYear: null,
      genres: [],
      coverArtUrl: null,
      sourceIds: {},
    };

    const musicBrainz = await this.fetchMusicBrainz({ title, artist, album });
    sources.push(musicBrainz);
    this.mergeMetadata(merged, musicBrainz);

    let spotify = {
      source: "spotify",
      status: "unavailable",
      message: "Missing SPOTIFY_CLIENT_ID/SECRET",
      data: null,
    };
    if (env.spotifyClientId && env.spotifyClientSecret) {
      spotify = await this.fetchSpotify({ title, artist, album });
    }
    sources.push(spotify);
    this.mergeMetadata(merged, spotify);

    let lastFm = {
      source: "lastfm",
      status: "unavailable",
      message: "Missing LASTFM_API_KEY",
      data: null,
    };
    if (env.lastFmApiKey) {
      lastFm = await this.fetchLastFm({ title, artist, album });
    }
    sources.push(lastFm);
    this.mergeMetadata(merged, lastFm);

    const response = {
      query: { title, artist, album, url },
      merged,
      sources,
      enrichedAt: Date.now(),
    };

    this.writeCache(cacheKey, response);

    this.emitConsole({
      type: "METADATA_FETCH",
      category: "Metadata",
      level: "success",
      message: `Metadata fetch completed for ${artist || "Unknown"} - ${album || title}`,
      data: { artist, album, title },
    });

    return response;
  }

  async fetchMusicBrainz({ title, artist, album }) {
    const hasArtist = Boolean(artist);
    const hasTitle = Boolean(title || album);

    if (!hasArtist || !hasTitle) {
      return {
        source: "musicbrainz",
        status: "skipped",
        message: "Artist and title/album required",
        data: null,
      };
    }

    try {
      if (album) {
        const query = `releasegroup:"${album}" AND artist:"${artist}"`;
        const { data } = await this.musicBrainzClient.get("/release-group", {
          params: { query, fmt: "json", limit: 1 },
        });

        const releaseGroup = data?.["release-groups"]?.[0];
        if (!releaseGroup) {
          return {
            source: "musicbrainz",
            status: "empty",
            message: "No release group match",
            data: null,
          };
        }

        const releaseYear = toYear(releaseGroup["first-release-date"]);
        const genres = (releaseGroup.tags ?? []).map((tag) => tag.name).filter(Boolean);

        return {
          source: "musicbrainz",
          status: "ok",
          message: "Release group matched",
          data: {
            title: releaseGroup.title,
            artist: releaseGroup["artist-credit"]?.[0]?.name ?? artist,
            album: releaseGroup.title,
            releaseYear,
            genres,
            coverArtUrl: releaseGroup.id ? `https://coverartarchive.org/release-group/${releaseGroup.id}/front` : null,
            sourceIds: { releaseGroupId: releaseGroup.id },
          },
        };
      }

      const query = `recording:"${title}" AND artist:"${artist}"`;
      const { data } = await this.musicBrainzClient.get("/recording", {
        params: { query, fmt: "json", limit: 1 },
      });

      const recording = data?.recordings?.[0];
      if (!recording) {
        return {
          source: "musicbrainz",
          status: "empty",
          message: "No recording match",
          data: null,
        };
      }

      const release = recording.releases?.[0];
      const releaseYear = toYear(release?.date ?? recording["first-release-date"]);
      const genres = (recording.tags ?? []).map((tag) => tag.name).filter(Boolean);

      return {
        source: "musicbrainz",
        status: "ok",
        message: "Recording matched",
        data: {
          title: recording.title,
          artist: recording["artist-credit"]?.[0]?.name ?? artist,
          album: release?.title ?? null,
          releaseYear,
          genres,
          coverArtUrl: release?.id ? `https://coverartarchive.org/release/${release.id}/front` : null,
          sourceIds: { recordingId: recording.id, releaseId: release?.id ?? null },
        },
      };
    } catch (error) {
      return {
        source: "musicbrainz",
        status: "error",
        message: error?.message ?? "MusicBrainz request failed",
        data: null,
      };
    }
  }

  async fetchLastFm({ title, artist, album }) {
    const hasArtist = Boolean(artist);
    const hasTitle = Boolean(title || album);

    if (!hasArtist || !hasTitle) {
      return {
        source: "lastfm",
        status: "skipped",
        message: "Artist and title/album required",
        data: null,
      };
    }

    try {
      if (album) {
        const { data } = await this.lastFmClient.get("/", {
          params: {
            method: "album.getInfo",
            artist,
            album,
            api_key: env.lastFmApiKey,
            format: "json",
            autocorrect: 1,
          },
        });

        if (data?.error) {
          return {
            source: "lastfm",
            status: "empty",
            message: data?.message ?? "No album match",
            data: null,
          };
        }

        const info = data?.album;
        if (!info) {
          return {
            source: "lastfm",
            status: "empty",
            message: "No album match",
            data: null,
          };
        }

        const genres = (info.tags?.tag ?? []).map((tag) => tag.name).filter(Boolean);
        const coverArtUrl = info.image?.find((img) => img.size === "extralarge")?.["#text"]
          || info.image?.[info.image.length - 1]?.["#text"]
          || null;

        return {
          source: "lastfm",
          status: "ok",
          message: "Album matched",
          data: {
            title: info.name,
            artist: info.artist,
            album: info.name,
            releaseYear: toYear(info.wiki?.published ?? info.releasedate),
            genres,
            coverArtUrl,
            sourceIds: { lastfmAlbum: info.mbid ?? null },
          },
        };
      }

      const { data } = await this.lastFmClient.get("/", {
        params: {
          method: "track.getInfo",
          artist,
          track: title,
          api_key: env.lastFmApiKey,
          format: "json",
          autocorrect: 1,
        },
      });

      if (data?.error) {
        return {
          source: "lastfm",
          status: "empty",
          message: data?.message ?? "No track match",
          data: null,
        };
      }

      const info = data?.track;
      if (!info) {
        return {
          source: "lastfm",
          status: "empty",
          message: "No track match",
          data: null,
        };
      }

      const genres = (info.toptags?.tag ?? []).map((tag) => tag.name).filter(Boolean);
      const coverArtUrl = info.album?.image?.find((img) => img.size === "extralarge")?.["#text"]
        || info.album?.image?.[info.album.image.length - 1]?.["#text"]
        || null;

      return {
        source: "lastfm",
        status: "ok",
        message: "Track matched",
        data: {
          title: info.name,
          artist: info.artist?.name ?? artist,
          album: info.album?.title ?? null,
          releaseYear: toYear(info.wiki?.published ?? info.releasedate),
          genres,
          coverArtUrl,
          sourceIds: { lastfmTrack: info.mbid ?? null },
        },
      };
    } catch (error) {
      return {
        source: "lastfm",
        status: "error",
        message: error?.message ?? "LastFM request failed",
        data: null,
      };
    }
  }

  async fetchSpotify({ title, artist, album }) {
    const hasArtist = Boolean(artist);
    const hasTitle = Boolean(title || album);

    if (!hasArtist || !hasTitle) {
      return {
        source: "spotify",
        status: "skipped",
        message: "Artist and title/album required",
        data: null,
      };
    }

    const token = await this.getSpotifyToken();
    if (!token) {
      return {
        source: "spotify",
        status: "error",
        message: "Unable to obtain Spotify token",
        data: null,
      };
    }

    try {
      const query = album
        ? `album:"${album}" artist:"${artist}"`
        : `track:"${title}" artist:"${artist}"`;
      const type = album ? "album" : "track";

      const { data } = await this.spotifyClient.get("/search", {
        params: { q: query, type, limit: 1 },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (album) {
        const item = data?.albums?.items?.[0];
        if (!item) {
          return {
            source: "spotify",
            status: "empty",
            message: "No album match",
            data: null,
          };
        }

        const artistId = item.artists?.[0]?.id ?? null;
        const genres = artistId ? await this.fetchSpotifyGenres(artistId, token) : [];

        return {
          source: "spotify",
          status: "ok",
          message: "Album matched",
          data: {
            title: item.name,
            artist: item.artists?.[0]?.name ?? artist,
            album: item.name,
            releaseYear: toYear(item.release_date),
            genres,
            coverArtUrl: item.images?.[0]?.url ?? null,
            sourceIds: { spotifyAlbumId: item.id, spotifyArtistId: artistId },
          },
        };
      }

      const trackItem = data?.tracks?.items?.[0];
      if (!trackItem) {
        return {
          source: "spotify",
          status: "empty",
          message: "No track match",
          data: null,
        };
      }

      const artistId = trackItem.artists?.[0]?.id ?? null;
      const genres = artistId ? await this.fetchSpotifyGenres(artistId, token) : [];

      return {
        source: "spotify",
        status: "ok",
        message: "Track matched",
        data: {
          title: trackItem.name,
          artist: trackItem.artists?.[0]?.name ?? artist,
          album: trackItem.album?.name ?? null,
          releaseYear: toYear(trackItem.album?.release_date),
          genres,
          coverArtUrl: trackItem.album?.images?.[0]?.url ?? null,
          sourceIds: { spotifyTrackId: trackItem.id, spotifyArtistId: artistId },
        },
      };
    } catch (error) {
      return {
        source: "spotify",
        status: "error",
        message: error?.response?.data?.error?.message ?? error?.message ?? "Spotify request failed",
        data: null,
      };
    }
  }

  async getSpotifyToken() {
    if (this.spotifyToken && Date.now() < this.spotifyTokenExpiresAt - SPOTIFY_TOKEN_SKEW_MS) {
      return this.spotifyToken;
    }

    try {
      const auth = Buffer.from(`${env.spotifyClientId}:${env.spotifyClientSecret}`).toString("base64");
      const { data } = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({ grant_type: "client_credentials" }).toString(),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: env.requestTimeoutMs,
        },
      );

      if (!data?.access_token) return null;
      this.spotifyToken = data.access_token;
      this.spotifyTokenExpiresAt = Date.now() + (data.expires_in * 1000);
      return this.spotifyToken;
    } catch {
      return null;
    }
  }

  async fetchSpotifyGenres(artistId, token) {
    if (!artistId) return [];
    try {
      const { data } = await this.spotifyClient.get(`/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data?.genres ?? [];
    } catch {
      return [];
    }
  }
}
