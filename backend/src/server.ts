import 'module-alias/register';
import mongoose from 'mongoose';
import { globSync } from 'glob';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Make sure we are running node 20+
const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit(1);
}

// import environmental variables from our variables.env file
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE) {
  console.error('DATABASE environment variable is not set');
  process.exit(1);
}

mongoose.connect(process.env.DATABASE);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

mongoose.connection.on('error', (error: Error) => {
  console.log(
    `1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`
  );
  console.error(`2. 🚫 Error → : ${error.message}`);
});

// Load all model files
const modelsFiles = globSync('./src/models/**/*.{js,ts}');

for (const filePath of modelsFiles) {
  // Use dynamic import for TypeScript compatibility
  require(path.resolve(filePath));
}

// Start our app!
import app from './app';
const port = process.env.PORT || 8888;
app.set('port', port);
const server = app.listen(port, () => {
  const address = server.address();
  if (address && typeof address === 'object') {
    console.log(`Express running → On PORT : ${address.port}`);
  } else if (typeof address === 'string') {
    console.log(`Express running → On PORT : ${address}`);
  }
});


