const mongoose = require('mongoose'),
  BacsModel = require('../models/bacsDocModel.js');

const models = {
  BacsDocument: mongoose.model('BacsDocument')
}
module.exports = models;
