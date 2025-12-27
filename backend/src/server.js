require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// MongoDB connection with better error handling and options
const DATABASE_URL = process.env.DATABASE?.trim();

if (!DATABASE_URL) {
  console.error('❌ DATABASE environment variable is not set or empty');
  console.error('Please check your .env file and ensure DATABASE is set correctly');
  process.exit(1);
}

console.log('\n🔌 ===== MONGODB CONNECTION =====');
console.log(`⏰ Connecting at: ${new Date().toISOString()}`);
// Hide password in logs
const maskedUrl = DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
console.log(`🔹 Database URL: ${maskedUrl}`);

mongoose.connect(DATABASE_URL, {
  serverSelectionTimeoutMS: 30000, // Increase to 30 seconds
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  w: 'majority',
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

mongoose.connection.on('error', (error) => {
  console.error('\n❌ ===== MONGODB CONNECTION ERROR =====');
  console.error(`⏰ Time: ${new Date().toISOString()}`);
  console.error(`1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`);
  console.error(`2. 🚫 Error → : ${error.message}`);
  if (error.stack) {
    console.error(`3. 🚫 Stack → : ${error.stack}`);
  }
  console.error('=====================================\n');
});

mongoose.connection.on('connecting', () => {
  console.log('🔄 Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully!');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🌐 Host: ${mongoose.connection.host}`);
  console.log('=====================================\n');
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

const modelsFiles = globSync('./src/models/**/*.js');

for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 8888);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
});
