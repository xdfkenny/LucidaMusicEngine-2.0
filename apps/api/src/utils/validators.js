export function validateSearchQuery(query) {
  if (typeof query !== "string" || !query.trim()) {
    return { ok: false, error: "Query is required" };
  }

  const trimmed = query.trim();
  if (trimmed.length < 2) return { ok: false, error: "Query must be at least 2 characters" };
  if (trimmed.length > 200) return { ok: false, error: "Query must be at most 200 characters" };

  return { ok: true, value: trimmed };
}

export function validateDownloadPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Request body is required" };
  }

  const { url, options = {} } = payload;

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { ok: false, error: "URL protocol is not supported" };
    }
  } catch {
    return { ok: false, error: "Invalid URL" };
  }

  return { ok: true, value: { url, options } };
}

export function validateMetadataPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Request body is required" };
  }

  const { title, artist, album, url } = payload;

  const hasQuery = Boolean(title || artist || album || url);
  if (!hasQuery) {
    return { ok: false, error: "Metadata query is required" };
  }

  return {
    ok: true,
    value: {
      title: title ?? null,
      artist: artist ?? null,
      album: album ?? null,
      url: url ?? null,
    },
  };
}
