import fs from 'fs-extra';
import path from 'path';
import { embedCoverArt } from '../src/utils/metadata-utils.js';

/**
 * Mini script to manually embed cover art into an audio file
 * Usage: node scripts/baka-embed-cover.js <audio_path> <cover_path>
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node scripts/baka-embed-cover.js <audio_path> <cover_path>');
    process.exit(1);
  }

  const [audioPath, coverPath] = args;
  const absAudioPath = path.resolve(audioPath);
  const absCoverPath = path.resolve(coverPath);

  console.log(`[EmbedScript] Embedding ${absCoverPath} into ${absAudioPath}...`);
  
  const success = await embedCoverArt(absAudioPath, absCoverPath);
  
  if (success) {
    console.log('[EmbedScript] Successfully embedded cover art!');
  } else {
    console.error('[EmbedScript] Failed to embed cover art. Check if FFmpeg is installed.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[EmbedScript] Unexpected error:', err);
  process.exit(1);
});
