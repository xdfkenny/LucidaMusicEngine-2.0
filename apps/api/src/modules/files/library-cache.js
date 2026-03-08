import path from "node:path";
import fs from "fs-extra";

const AUDIO_EXTENSIONS = /\.(flac|mp3|wav|aiff)$/i;
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png)$/i;

function buildCoverUrl(artist, album) {
  const encodedArtist = encodeURIComponent(artist);
  const encodedAlbum = encodeURIComponent(album);
  return `/api/files/cover?artist=${encodedArtist}&album=${encodedAlbum}`;
}

export function pickCoverFile(files) {
  const images = files.filter((file) => IMAGE_EXTENSIONS.test(file));
  if (!images.length) return null;
  const preferred = images.find((file) => file.toLowerCase().startsWith("cover"));
  return preferred ?? images[0];
}

function stripExtension(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}

function parseTrackTitle(filename, artist) {
  const raw = stripExtension(filename);
  const match = raw.match(/^(\d{1,3})[\s._-]+(.+)$/);
  let trackNumber = null;
  let title = raw;

  if (match) {
    trackNumber = Number(match[1]);
    title = match[2];
  }

  if (artist) {
    const prefix = `${artist} - `.toLowerCase();
    if (title.toLowerCase().startsWith(prefix)) {
      title = title.slice(prefix.length);
    }
  }

  return {
    trackNumber: Number.isFinite(trackNumber) ? trackNumber : null,
    title: title.trim(),
  };
}

function buildTrackList(files, artist) {
  return files
    .filter((file) => AUDIO_EXTENSIONS.test(file))
    .map((file) => {
      const parsed = parseTrackTitle(file, artist);
      return {
        trackNumber: parsed.trackNumber,
        title: parsed.title,
        filename: file,
      };
    })
    .sort((a, b) => {
      const aNum = a.trackNumber ?? 9999;
      const bNum = b.trackNumber ?? 9999;
      if (aNum !== bNum) return aNum - bNum;
      return a.title.localeCompare(b.title);
    });
}

async function scanAlbum(albumPath) {
  const files = await fs.readdir(albumPath);
  const audioFiles = files.filter((file) => AUDIO_EXTENSIONS.test(file));
  const imageFiles = files.filter((file) => IMAGE_EXTENSIONS.test(file));
  const coverFile = pickCoverFile(imageFiles);

  return {
    files,
    audioFiles,
    imageFiles,
    coverFile,
  };
}

export async function buildLibrarySnapshot(downloadsDir, cache) {
  if (!await fs.pathExists(downloadsDir)) return [];

  const artists = await fs.readdir(downloadsDir);
  const output = [];

  for (const artist of artists) {
    const artistPath = path.join(downloadsDir, artist);
    const artistStat = await fs.stat(artistPath);
    if (!artistStat.isDirectory()) continue;

    const albums = await fs.readdir(artistPath);
    const albumRows = [];

    for (const album of albums) {
      const albumPath = path.join(artistPath, album);
      const albumStat = await fs.stat(albumPath);
      if (!albumStat.isDirectory()) continue;

      const cacheKey = albumPath;
      const cached = cache.get(cacheKey);
      if (cached && cached.mtimeMs === albumStat.mtimeMs) {
        albumRows.push(cached.data);
        continue;
      }

      const { audioFiles, imageFiles, coverFile } = await scanAlbum(albumPath);
      const entry = {
        name: album,
        files: [...audioFiles, ...imageFiles],
        trackCount: audioFiles.length,
        coverFile,
        coverUrl: coverFile ? buildCoverUrl(artist, album) : null,
      };

      cache.set(cacheKey, { mtimeMs: albumStat.mtimeMs, data: entry });
      albumRows.push(entry);
    }

    if (albumRows.length) output.push({ name: artist, albums: albumRows });
  }

  return output;
}

export async function buildAlbumDetail(downloadsDir, cache, artist, album) {
  if (!artist || !album) return null;
  if (!await fs.pathExists(downloadsDir)) return null;

  const albumPath = path.join(downloadsDir, artist, album);
  if (!await fs.pathExists(albumPath)) return null;

  const albumStat = await fs.stat(albumPath);
  if (!albumStat.isDirectory()) return null;

  const cached = cache.get(albumPath);
  if (cached && cached.mtimeMs === albumStat.mtimeMs) {
    return cached.data;
  }

  const { files, audioFiles, imageFiles, coverFile } = await scanAlbum(albumPath);
  const tracks = buildTrackList(audioFiles, artist);

  const entry = {
    artist,
    name: album,
    files: [...audioFiles, ...imageFiles],
    trackCount: audioFiles.length,
    coverFile,
    coverUrl: coverFile ? buildCoverUrl(artist, album) : null,
    tracks,
  };

  cache.set(albumPath, { mtimeMs: albumStat.mtimeMs, data: entry });
  return entry;
}
