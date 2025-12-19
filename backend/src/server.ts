require('module-alias/register');
import mongoose from 'mongoose';
import { globSync } from 'glob';
import path from 'path';

// Make sure we are running node 7.6+
const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.DATABASE || '');

mongoose.connection.on('error', (error) => {
  console.log(
    `1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`
  );
  console.error(`2. 🚫 Error → : ${error.message}`);
});

const modelsFiles = globSync('./src/models/**/*.ts');

for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

// Start our app!
import app from './app';
app.set('port', process.env.PORT || 8888);
const server = app.listen(app.get('port'), () => {
  const address = server.address();
  const port = typeof address === 'string' ? address : address?.port || app.get('port');
  console.log(`Express running → On PORT : ${port}`);
});

