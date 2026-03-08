import { setInterval } from "node:timers";

export class ConsoleService {
  constructor({ bufferSize = 2000 } = {}) {
    this.bufferSize = bufferSize;
    this.buffer = [];
    this.clients = new Set();
    this.nextId = 1;
    this.statusProvider = null;
  }

  setStatusProvider(fn) {
    this.statusProvider = typeof fn === "function" ? fn : null;
  }

  emit(event) {
    const payload = {
      id: this.nextId++,
      ts: Date.now(),
      type: event.type ?? "SYSTEM_STATUS",
      category: event.category ?? "System",
      level: event.level ?? "info",
      message: event.message ?? "",
      data: event.data ?? null,
    };

    this.buffer.push(payload);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.splice(0, this.buffer.length - this.bufferSize);
    }

    this.broadcast(payload);
    return payload;
  }

  broadcast(payload) {
    const encoded = `event: log\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const res of this.clients) {
      try {
        res.write(encoded);
      } catch {
        this.clients.delete(res);
      }
    }
  }

  attachClient(res) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders?.();

    const initPayload = {
      logs: this.buffer,
      serverTime: Date.now(),
    };
    res.write(`event: init\ndata: ${JSON.stringify(initPayload)}\n\n`);

    this.clients.add(res);

    const keepAlive = setInterval(() => {
      if (res.writableEnded) return;
      res.write("event: ping\ndata: {}\n\n");
    }, 15000);

    res.on("close", () => {
      clearInterval(keepAlive);
      this.clients.delete(res);
    });
  }

  startStatusHeartbeat(intervalMs = 10000) {
    setInterval(() => {
      if (!this.statusProvider) return;
      const status = this.statusProvider();
      this.emit({
        type: "SYSTEM_STATUS",
        category: "System",
        level: "info",
        message: `Backend: ${status.backend} | Scraper: ${status.scraper} | Queue: ${status.queue}`,
        data: status,
      });
    }, intervalMs);
  }
}
