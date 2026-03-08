import JSON5 from "json5";
import { env } from "../config/env.js";
import { httpClient } from "../lib/http-client.js";

function parseEnclosedValue(text, startMarker, endMarker) {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Missing marker: ${startMarker}`);
  const contentStart = startIdx + startMarker.length;

  const endIdx = text.indexOf(endMarker, contentStart);
  if (endIdx === -1) throw new Error(`Missing marker: ${endMarker}`);

  return text.slice(contentStart, endIdx);
}

export class LucidaClient {
  async fetchSearchHtml(query) {
    const response = await httpClient.get(`${env.lucidaBaseUrl}/search`, {
      params: {
        service: "tidal",
        country: env.defaultCountry,
        query,
      },
    });

    return response.data;
  }

  async resolveItemPage(url, country = env.defaultCountry) {
    const response = await httpClient.get(`${env.lucidaBaseUrl}/`, {
      params: { url, country },
    });

    return response.data;
  }

  parsePageData(html) {
    const startMarker = 'const data = [';
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) {
      throw new Error("Unable to find Lucida data block");
    }

    const endMarker = '];';
    const endIdx = html.indexOf(endMarker, startIdx);
    if (endIdx === -1) {
      throw new Error("Unable to find end of Lucida data block");
    }

    const raw = html.slice(startIdx + 'const data = '.length, endIdx + 1);
    let data;
    try {
      data = JSON5.parse(raw);
    } catch (e) {
      throw new Error(`Failed to parse Lucida data: ${e.message}`);
    }

    if (!Array.isArray(data)) {
      throw new Error("Lucida data is not an array");
    }

    // Find the item that contains the "info" object with metadata
    for (const item of data) {
      if (item.type === "data" && item.data && item.data.info) {
        return item.data;
      }
    }

    throw new Error("No metadata found in Lucida data block");
  }

  async requestTrackHandoff({ country, metadata, isPrivate, tokenExpiry, csrf, csrfFallback, url }) {
    const response = await httpClient.post(`${env.lucidaBaseUrl}/api/load?url=%2Fapi%2Ffetch%2Fstream%2Fv2`, {
      account: {
        id: country,
        type: "country",
      },
      compat: false,
      downscale: "original",
      handoff: true,
      metadata,
      private: isPrivate,
      token: {
        expiry: tokenExpiry,
        primary: csrf,
        secondary: csrfFallback ?? null,
      },
      upload: { enabled: false },
      url,
    });

    if (response.data?.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  }

  async getRequestStatus(handoff) {
    const response = await httpClient.get(`https://${handoff.server}.lucida.to/api/fetch/request/${handoff.handoff}`);
    return response.data;
  }

  async downloadRequestFile(handoff) {
    return httpClient.get(`https://${handoff.server}.lucida.to/api/fetch/request/${handoff.handoff}/download`, {
      responseType: "stream",
    });
  }
}
