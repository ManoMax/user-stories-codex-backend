require('dotenv').config()
require('module-alias/register');
const app = require('@app');
const config = require('@config');
const databaseConfig = require('./config/database');

var server = app.listen(process.env.PORT || config.app.port, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`Server Up: port ${config.app.port}`);
});

async function startServer() {
  databaseConfig();
  server;
}

startServer();

module.exports = server;