import * as cheerio from "cheerio";

function decodeLucidaWrappedUrl(value) {
  if (!value || !value.includes("/api/load?url=")) return value;

  try {
    const after = value.split("/api/load?url=")[1];
    const decoded = decodeURIComponent(after);
    const index = decoded.indexOf("url=");
    return index === -1 ? decoded : decodeURIComponent(decoded.slice(index + 4));
  } catch {
    return value;
  }
}

function normalizeCoverSize(url) {
  if (!url) return null;
  return url.replace(/(\d+x\d+)(\.(jpg|png))/i, "1280x1280$2");
}

function extractCover($, el) {
  const img = $(el).find("img").first();
  let cover = img.attr("src") ?? img.attr("data-src") ?? img.attr("data-original") ?? null;

  if (!cover) {
    const styleEl = $(el)
      .find("[style]")
      .filter((_, node) => (($(node).attr("style") ?? "").includes("background-image")))
      .first();

    const style = styleEl.attr("style") ?? "";
    const match = style.match(/url\(['\"]?(.*?)['\"]?\)/);
    if (match) cover = match[1];
  }

  if (!cover) {
    const fallback = $(el).find('[src*="resources.tidal.com"], [data-src*="resources.tidal.com"]').first();
    cover = fallback.attr("src") ?? fallback.attr("data-src") ?? null;
  }

  return normalizeCoverSize(decodeLucidaWrappedUrl(cover));
}

export function parseSearchResults(html) {
  const $ = cheerio.load(html);
  const results = [];

  $(".search-result-track").each((_, el) => {
    const title = $(el).find("h1").text().trim();
    const artist = $(el).find("h2").text().trim();
    const href = $(el).find(".metadata a").attr("href");
    if (!href) return;

    const encodedUrl = href.replace("/?url=", "");
    const url = encodedUrl ? decodeURIComponent(encodedUrl) : null;

    results.push({ title, artist, url, cover: extractCover($, el) });
  });

  return results;
}
