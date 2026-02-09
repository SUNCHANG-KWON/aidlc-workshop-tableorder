export class SseHub {
  constructor() {
    this.clientsByStore = new Map();
  }

  subscribe(storeId, res, filter = () => true) {
    if (!this.clientsByStore.has(storeId)) {
      this.clientsByStore.set(storeId, new Set());
    }
    const clients = this.clientsByStore.get(storeId);
    const client = { res, filter };
    clients.add(client);

    const heartbeat = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(heartbeat);
      }
    }, 20000);

    return () => {
      clearInterval(heartbeat);
      clients.delete(client);
      if (clients.size === 0) {
        this.clientsByStore.delete(storeId);
      }
    };
  }

  broadcast(storeId, event, payload) {
    const clients = this.clientsByStore.get(storeId);
    if (!clients || clients.size === 0) {
      return;
    }
    const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of clients) {
      try {
        if (!client.filter(event, payload)) {
          continue;
        }
        client.res.write(message);
      } catch {
        clients.delete(client);
      }
    }
  }
}
