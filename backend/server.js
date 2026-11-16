const path = require('node:path');
const fs = require('node:fs/promises');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dataFile = path.resolve(__dirname, process.env.SIGNUPS_FILE || './data/signups.json');
let signups = [];
let writeQueue = Promise.resolve();

app.use(express.json({ limit: '10kb' }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200' }));

app.post('/api/signups', async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ message: 'Send a JSON object with a name and email.' });
  }

  const unexpectedFields = Object.keys(req.body).filter((key) => key !== 'name' && key !== 'email');
  if (unexpectedFields.length > 0) {
    return res.status(400).json({ message: 'Only name and email fields are accepted.' });
  }

  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  if (name.length === 0 || name.length > 100) {
    return res.status(400).json({ message: 'Name is required and must be 100 characters or fewer.' });
  }

  if (email.length > 254 || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }

  try {
    await saveSignup({ name, email });
    return res.status(201).json({ message: `Thanks, ${name}! Your sign-up was saved locally.` });
  } catch (error) {
    return next(error);
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON.' });
  }

  if (error.status === 413) {
    return res.status(413).json({ message: 'Request body is too large.' });
  }

  console.error('Failed to process sign-up request:', error);
  return res.status(500).json({ message: 'Could not save your sign-up right now.' });
});

async function loadSignups() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });

  let contents;
  try {
    contents = await fs.readFile(dataFile, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    await fs.writeFile(dataFile, '[]\n', 'utf8');
    return [];
  }

  const savedSignups = JSON.parse(contents);
  if (!Array.isArray(savedSignups) || savedSignups.some((signup) =>
    !signup || typeof signup.name !== 'string' || typeof signup.email !== 'string'
  )) {
    throw new Error(`Sign-up data file has an invalid format: ${dataFile}`);
  }

  return savedSignups.map(({ name, email }) => ({ name, email }));
}

function saveSignup(signup) {
  const operation = writeQueue.then(async () => {
    const updatedSignups = [...signups, signup];
    const temporaryFile = `${dataFile}.tmp`;
    await fs.writeFile(temporaryFile, `${JSON.stringify(updatedSignups, null, 2)}\n`, 'utf8');
    await fs.rename(temporaryFile, dataFile);
    signups = updatedSignups;
  });

  writeQueue = operation.catch(() => undefined);
  return operation;
}

async function startServer() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  signups = await loadSignups();
  app.listen(port, '127.0.0.1', () => {
    console.log(`Skillspace API listening at http://127.0.0.1:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Could not start Skillspace API:', error);
    process.exitCode = 1;
  });
}
