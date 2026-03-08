import { LucidaClient } from "../../scraper/lucida-client.js";
import { parseSearchResults } from "../../scraper/lucida-parser.js";
import { BakaScraper } from "../../scraper/baka.js";

export class SearchService {
  constructor({ consoleService, metadataService } = {}) {
    this.client = new LucidaClient();
    this.baka = new BakaScraper();
    this.consoleService = consoleService ?? null;
    this.metadataService = metadataService ?? null;
  }

  async search(query) {
    this.consoleService?.emit({
      type: "SCRAPER_EVENT",
      category: "Scraper",
      level: "info",
      message: `Searching Lucida proxy for "${query}"`,
      data: { query },
    });

    const html = await this.client.fetchSearchHtml(query);
    const results = parseSearchResults(html);

    this.consoleService?.emit({
      type: "SCRAPER_EVENT",
      category: "Scraper",
      level: "success",
      message: `Proxy search returned ${results.length} results`,
      data: { count: results.length },
    });

    return results;
  }

  async bakaSearch(query, service = 'soundcloud', enrich = false) {
    this.consoleService?.emit({
      type: "SCRAPER_EVENT",
      category: "Scraper",
      level: "info",
      message: `Searching Lucida Baka (${service}) for "${query}"`,
      data: { query, service },
    });

    let results = await this.baka.search(query, service);

    if (enrich && this.metadataService) {
      this.consoleService?.emit({
        type: "SCRAPER_EVENT",
        category: "Scraper",
        level: "info",
        message: `Enriching ${results.length} Baka results with external metadata...`,
        data: { count: results.length },
      });

      // Enrich results in parallel (limited)
      results = await Promise.all(results.map(async (item) => {
        try {
          const enrichment = await this.metadataService.enrich({
            title: item.title,
            artist: item.artist,
            album: item.album || null
          });

          if (enrichment?.merged?.coverArtUrl) {
            item.cover = enrichment.merged.coverArtUrl;
          }
          if (enrichment?.merged?.genres?.length) {
            item.genres = enrichment.merged.genres;
          }
        } catch (e) {
          // Ignore enrichment errors for individual items
        }
        return item;
      }));
    }

    this.consoleService?.emit({
      type: "SCRAPER_EVENT",
      category: "Scraper",
      level: "success",
      message: `Baka search returned ${results.length} results`,
      data: { count: results.length },
    });

    return results;
  }
}
