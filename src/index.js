import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 3000);

const app = createApp({
  dataPath: path.resolve(dirname, '../data/db.json'),
  publicDir: path.resolve(dirname, '../public')
});

await app.dataStore.ensureInitialized();

app.server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`table-order server listening on http://localhost:${port}`);
});
