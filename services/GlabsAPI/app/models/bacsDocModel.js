const mongoose = require('mongoose')

const Schema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  created: { 
    type: Date, 
    default: Date.now 
  },
  updated: { 
    type: Date, 
    default: Date.now 
  },
  bacsDocument: {
    type: Object,
    required: true
  },
  state: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});

const BacsDoc = mongoose.model('BacsDocument', Schema);

module.exports = {BacsDoc}