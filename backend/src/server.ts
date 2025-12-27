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

// Enhanced MongoDB connection options for Atlas and local connections
mongoose.connect(process.env.DATABASE, {
  serverSelectionTimeoutMS: 30000, // Increased to 30 seconds for Atlas
  socketTimeoutMS: 45000, // 45 seconds socket timeout
  connectTimeoutMS: 30000, // 30 seconds connection timeout
  retryWrites: true, // Enable retryable writes
  w: 'majority', // Write concern
  // Additional options for better Atlas connectivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5, // Maintain at least 5 socket connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  heartbeatFrequencyMS: 10000, // How often to check connection status
} as mongoose.ConnectOptions);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

mongoose.connection.on('error', (error: Error) => {
  console.log('\n❌ ===== MONGODB CONNECTION ERROR =====');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`);
  console.error(`2. 🚫 Error → : ${error.message}`);
  console.error(`3. 🚫 Stack → : ${error.stack}`);
  
  // Provide specific troubleshooting steps based on error type
  if (error.message.includes('Server selection timed out') || error.message.includes('IP')) {
    console.log('\n📋 TROUBLESHOOTING STEPS:');
    console.log('1. ✅ Check MongoDB Atlas IP Whitelist:');
    console.log('   → Go to: https://cloud.mongodb.com/');
    console.log('   → Navigate to: Network Access → IP Access List');
    console.log('   → Add your current IP address (or use 0.0.0.0/0 for all IPs - less secure)');
    console.log('2. ✅ Verify your DATABASE connection string in .env file');
    console.log('3. ✅ Check if your MongoDB Atlas cluster is running');
    console.log('4. ✅ Verify network connectivity (firewall, VPN, etc.)');
    console.log('5. ✅ Ensure MongoDB Atlas username and password are correct');
  } else if (error.message.includes('authentication')) {
    console.log('\n📋 TROUBLESHOOTING STEPS:');
    console.log('1. ✅ Check MongoDB Atlas Database User credentials');
    console.log('2. ✅ Verify username and password in connection string');
    console.log('3. ✅ Ensure database user has proper permissions');
  } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
    console.log('\n📋 TROUBLESHOOTING STEPS:');
    console.log('1. ✅ Check your internet connection');
    console.log('2. ✅ Verify MongoDB Atlas cluster hostname is correct');
    console.log('3. ✅ Check DNS resolution');
  }
  
  console.log('=====================================\n');
});

mongoose.connection.on('connected', () => {
  console.log('\n✅ ===== MONGODB CONNECTED =====');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🔹 Database: ${mongoose.connection.name}`);
  console.log(`🔹 Host: ${mongoose.connection.host}`);
  console.log(`🔹 Port: ${mongoose.connection.port}`);
  console.log(`🔹 Ready State: ${mongoose.connection.readyState} (1 = connected)`);
  console.log('================================\n');
});

// Handle connection timeout specifically
mongoose.connection.on('timeout', () => {
  console.log('\n⏱️  ===== MONGODB CONNECTION TIMEOUT =====');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log('⚠️  Connection attempt timed out');
  console.log('📋 Check:');
  console.log('   1. MongoDB Atlas IP whitelist includes your IP');
  console.log('   2. Network connectivity is stable');
  console.log('   3. MongoDB Atlas cluster is running');
  console.log('==========================================\n');
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


