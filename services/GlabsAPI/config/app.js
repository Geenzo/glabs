const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  config = require('./index.js'),
  database = require('./database')(mongoose, config),
  consign = require('consign'),
  opn = require('opn'),
  {RetrieveBacsDocs} = require('../app/api/retrieveBACS'),
  {ReturnDebits} = require('../app/api/returnDebits')

app.use(express.static('.'))
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())

consign()
  .include('services/GlabsAPI/app/setup/index.js')
  .then('services/GlabsAPI/app/routes')
  .into(app);

// Retrieves new BACS on load of application
RetrieveBacsDocs()
.then(ReturnDebits)

//opens front-end page for use to see BACs and returned debit items
// opn('http://localhost:3001/application/')

module.exports = app;
