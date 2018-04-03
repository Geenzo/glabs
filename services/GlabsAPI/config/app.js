const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  config = require('./index.js'),
  database = require('./database')(mongoose, config),
  consign = require('consign')

app.use(express.static('.'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

consign()
  .include('services/GlabsAPI/app/setup/index.js')
  .then('services/GlabsAPI/app/api/retrieveBACS.js')
  .into(app);

module.exports = app;
