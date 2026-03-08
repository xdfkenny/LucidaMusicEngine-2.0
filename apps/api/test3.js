import Lucida from 'lucida';
import SoundCloud from 'lucida/streamers/soundcloud/main.js';

async function bakaTest() {
  try {
    const lucida = new Lucida({
      modules: {
        soundcloud: new SoundCloud()
      }
    });

    console.log("Searching soundcloud...");
    // Let's see if it has a search method on the wrapper or on the module
    const results = await lucida.modules.soundcloud.search("Eminem", 5);
    console.log("Results:", results);

    if (results.length > 0) {
      const url = results[0].url;
      console.log("Getting track info for:", url);
      const track = await lucida.getByUrl(url);
      console.log("Track:", track);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

bakaTest();
