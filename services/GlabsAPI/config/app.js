const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  config = require('./index.js'),
  database = require('./database')(mongoose, config),
  consign = require('consign'),
  {RetrieveBacsDocs} = require('../app/api/retrieveBACS'),
  CronJob = require('cron').CronJob

app.use(express.static('.'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//Cron job to check for new BACs every minute
new CronJob('* * * * *', function() {
  RetrieveBacsDocs()
  console.log('Cron Job for Retrieving BACS has been triggered...');
}, null, true, 'Europe/London');

consign()
  .include('services/GlabsAPI/app/setup/index.js')
  .into(app);

//Retrieves new BACS on load of application
RetrieveBacsDocs()

module.exports = app;
