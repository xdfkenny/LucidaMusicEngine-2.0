import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Embed cover art into an audio file using FFmpeg
 * @param {string} audioPath - Path to the audio file
 * @param {string} coverPath - Path to the image file
 * @param {Object} metadata - Optional metadata (title, artist, album)
 */
export async function embedCoverArt(audioPath, coverPath, metadata = {}) {
  if (!await fs.exists(audioPath) || !await fs.exists(coverPath)) {
    console.warn(`[MetadataUtils] Missing files: audio=${audioPath}, cover=${coverPath}`);
    return false;
  }

  const ext = path.extname(audioPath).toLowerCase();
  const tempPath = `${audioPath}.tmp${ext}`;

  try {
    let command = '';

    if (ext === '.mp3') {
      command = `ffmpeg -y -i "${audioPath}" -i "${coverPath}" -map 0:0 -map 1:0 -c copy -id3v2_version 3 -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)"`;
    } else if (ext === '.flac') {
      command = `ffmpeg -y -i "${audioPath}" -i "${coverPath}" -map 0:0 -map 1:0 -c copy -disposition:v:0 attached_pic`;
    } else if (ext === '.m4a' || ext === '.mp4') {
      command = `ffmpeg -y -i "${audioPath}" -i "${coverPath}" -map 0:0 -map 1:0 -c copy -disposition:v:0 attached_pic`;
    } else {
      console.warn(`[MetadataUtils] Unsupported format for embedding: ${ext}`);
      return false;
    }

    // Add metadata tags if provided
    if (metadata.title) command += ` -metadata title="${metadata.title.replace(/"/g, '\\"')}"`;
    if (metadata.artist) command += ` -metadata artist="${metadata.artist.replace(/"/g, '\\"')}"`;
    if (metadata.album) command += ` -metadata album="${metadata.album.replace(/"/g, '\\"')}"`;

    command += ` "${tempPath}"`;

    // console.log(`[MetadataUtils] Running: ${command}`);
    await execAsync(command);

    // Replace original with temp
    await fs.remove(audioPath);
    await fs.move(tempPath, audioPath);

    return true;
  } catch (err) {
    console.error(`[MetadataUtils] Error embedding cover:`, err.message);
    if (await fs.exists(tempPath)) await fs.remove(tempPath);
    return false;
  }
}
