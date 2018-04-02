const fs = require('fs');
const xml2js = require('xml2js');
const glob = require('glob');
const moment = require('moment');
const path = require('path');
const {BacsDoc} = require('../models/bacsDocModel');


const parser = new xml2js.Parser({explicitArray : false, ignoreAttrs : false, mergeAttrs : true});

const retrieveBacsFromDirectory = () => {
  return new Promise ((resolve, reject) => {
    const DirectoryDate = moment().subtract(1, 'days').format('DD-MM-YYYY');
    let yesterdaysBacFiles = glob.sync(path.join(__dirname, `../../../../BACSDirectory/newBACS/${DirectoryDate}/*.xml`));
    if (yesterdaysBacFiles.length > 0) {
    resolve(yesterdaysBacFiles)
  } else {
    reject(`No BACS found for ${DirectoryDate}`);
  }
  })
};

const readBacFiles = (retrievedBacs) => {
    let bacs = retrievedBacs.map(bacfile => {
        return new Promise ((resolve, reject) => {
            fs.readFile(bacfile, (err, data) => {
                resolve(data);
            })
            })
    })

    return Promise.all(bacs)
};

const parseBacFile = (bacFilesXMLData) => {
console.log(bacFilesXMLData);

}

const RetrieveBacsDocs = () => {
    return retrieveBacsFromDirectory()
        .then(readBacFiles)
        .then(parseBacFile)
        .catch((err) => {
            console.log(`${err} - RetrieveBacsDocs task now exiting...`);
        })
}

RetrieveBacsDocs()
// module.exports = {RetrieveBacsDocs};