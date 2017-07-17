const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const routes = require(`${__dirname}/api/routes.js`);

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(express.static('./output'));
app.use(cors());
app.use('/', routes);

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers',
    'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.PW}@ds159662.mlab.com:59662/enigma`, { useMongoClient: true });

const db = mongoose.connection;

db.on('error', (error) => {
  console.log('Unable to connect to database due to:', error);
})
.once('open', () => {
  console.log('Successfully connected to database');
});

app.get('/*', (req, res) => {
  // const endpoint = req.path;
  res.sendFile(`${__dirname}/output/index.html`);
});

app.listen(port, () => {
  console.log(`Connected to ${port}`);
});

module.exports = { app };
