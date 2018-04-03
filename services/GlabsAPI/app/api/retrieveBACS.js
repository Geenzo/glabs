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
    let parsedBacsData = bacFilesXMLData.map((bacXMLData) => {
        return new Promise((resolve, reject) => {
            return parser.parseString(bacXMLData, (err, parsedData) => {
                resolve(parsedData)
            })
        })
    })

    return Promise.all(parsedBacsData)
}

const saveBacToDB = (parsedBacData) => {
    
    let savedBac = parsedBacData.map(parsedBac => {
        // console.log(parsedBac);
        // console.log(parsedBac.BACSDocument.Data.ARUDD);
        
        return new Promise((resolve, reject) => {
            let bacsDocument = new BacsDoc({
              name: `BAC - ${parsedBac.BACSDocument.Data.ARUDD.Header.adviceNumber} - ${parsedBac.BACSDocument.Data.ARUDD.Header.currentProcessingDate} - ${parsedBac.BACSDocument.Data.ARUDD.AddresseeInformation.name}`,
              created: moment().format('DD-MM-YYYY'),
              updated: moment().format('DD-MM-YYYY'),
              bacsDocument: parsedBac.BACSDocument,
              state: "Ready For Processing"
            })
            console.log(bacsDocument);
            
            return bacsDocument.save()
          })
    })
    
}

const RetrieveBacsDocs = () => {
    return retrieveBacsFromDirectory()
        .then(readBacFiles)
        .then(parseBacFile)
        .then(saveBacToDB)
        .catch((err) => {
            console.log(`${err} - RetrieveBacsDocs task now exiting...`);
        })
}

RetrieveBacsDocs()
// module.exports = {RetrieveBacsDocs};