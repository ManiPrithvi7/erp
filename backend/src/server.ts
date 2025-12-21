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

console.log('\n🔌 ===== MONGODB CONNECTION =====');
console.log(`⏰ Connecting at: ${new Date().toISOString()}`);
console.log(`🔹 Database URL: ${process.env.DATABASE.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}`); // Hide password

mongoose.connect(process.env.DATABASE, {
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds socket timeout
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

mongoose.connection.on('error', (error: Error) => {
  console.log('\n❌ ===== MONGODB CONNECTION ERROR =====');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`);
  console.error(`2. 🚫 Error → : ${error.message}`);
  console.error(`3. 🚫 Stack → : ${error.stack}`);
  console.log('=====================================\n');
});

mongoose.connection.on('connected', () => {
  console.log('\n✅ ===== MONGODB CONNECTED =====');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🔹 Database: ${mongoose.connection.name}`);
  console.log(`🔹 Host: ${mongoose.connection.host}`);
  console.log(`🔹 Port: ${mongoose.connection.port}`);
  console.log('================================\n');
});

mongoose.connection.on('disconnected', () => {
  console.log('\n⚠️  ===== MONGODB DISCONNECTED =====');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log('====================================\n');
});

// Load all model files (only .ts files to avoid duplicate model registration)
// In development with ts-node, we only need .ts files
// In production, compiled .js files will be in dist/ folder
const modelsFiles = globSync('./src/models/**/*.ts');

for (const filePath of modelsFiles) {
  // Use require for dynamic loading - TypeScript can't statically analyze this
  // Models are loaded for their side effects (registering with Mongoose)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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


