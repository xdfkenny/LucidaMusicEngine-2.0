const store = new Map();

export function createJob({ id, url, options }) {
  const now = Date.now();
  const job = {
    id,
    url,
    options,
    status: "pending",
    progress: 0,
    message: "Queued",
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    finishedAt: null,
    result: null,
    error: null,
    control: {
      paused: false,
      cancelled: false,
    },
  };

  store.set(id, job);
  return job;
}

export function updateJob(id, patch) {
  const current = store.get(id);
  if (!current) return null;

  const next = {
    ...current,
    ...patch,
    updatedAt: Date.now(),
  };

  store.set(id, next);
  return next;
}

export function updateJobControl(id, patch) {
  const current = store.get(id);
  if (!current) return null;

  const next = {
    ...current,
    control: {
      ...current.control,
      ...patch,
    },
    updatedAt: Date.now(),
  };

  store.set(id, next);
  return next;
}

export function getJob(id) {
  return store.get(id) ?? null;
}

export function listJobs() {
  return [...store.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function cleanupJobs(maxAgeMs = 60 * 60 * 1000) {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, job] of store.entries()) {
    if (job.finishedAt && now - job.finishedAt > maxAgeMs) {
      store.delete(id);
      cleaned += 1;
    }
  }

  return cleaned;
}
