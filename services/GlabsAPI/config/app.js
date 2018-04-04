const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  config = require('./index.js'),
  database = require('./database')(mongoose, config),
  consign = require('consign'),
  {RetrieveBacsDocs} = require('../app/api/retrieveBACS'),
  CronJob = require('cron').CronJob,
  {ReturnDebits} = require('../app/api/returnDebits')

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

//Cron job to process BACs every 2 minute
new CronJob('*/2 * * * *', function() {
  ReturnDebits()
  console.log('Cron Job for Processing BACS has been triggered...');
}, null, true, 'Europe/London');

consign()
  .include('services/GlabsAPI/app/setup/index.js')
  .then('services/GlabsAPI/app/routes')
  .into(app);

// Retrieves new BACS on load of application
RetrieveBacsDocs()
.then(ReturnDebits)


module.exports = app;
