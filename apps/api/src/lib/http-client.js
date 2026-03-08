import axios from "axios";
import { env } from "../config/env.js";

export const httpClient = axios.create({
  timeout: env.requestTimeoutMs,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
  },
});
