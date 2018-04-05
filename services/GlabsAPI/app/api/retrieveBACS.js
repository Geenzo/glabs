const fs = require('fs'),
    xml2js = require('xml2js'),
    glob = require('glob'),
    moment = require('moment'),
    path = require('path'),
    {BacsDoc} = require('../models/bacsDocModel'),
    archiver = require('archiver');

const parser = new xml2js.Parser({explicitArray : false, ignoreAttrs : false, mergeAttrs : true});

const retrieveBacsFromDirectory = () => {
  return new Promise ((resolve, reject) => {
    const DirectoryDate = moment().subtract(1, 'days').format('DD-MM-YYYY');
    let yesterdaysBacFiles = glob.sync(path.join(`BACSDirectory/newBACS/${DirectoryDate}/*.xml`));
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

        return new Promise((resolve, reject) => {
            let bacsDocument = new BacsDoc({
              name: `BAC - ${parsedBac.BACSDocument.Data.ARUDD.Header.adviceNumber} - ${parsedBac.BACSDocument.Data.ARUDD.Header.currentProcessingDate} - ${parsedBac.BACSDocument.Data.ARUDD.AddresseeInformation.name}`,
              created: moment().format('DD-MM-YYYY'),
              updated: moment().format('DD-MM-YYYY'),
              bacsDocument: parsedBac.BACSDocument,
              state: "Ready For Processing"
            })
            
            return bacsDocument.save().then(savedBac => {
                resolve(savedBac)
            })
          })
    })
    
    return Promise.all(savedBac)
}

const archiveProcessedBac = (savedBac) => {
    return new Promise((resolve, reject) => {
        const DirectoryDate = moment().subtract(1, 'days').format('DD-MM-YYYY');
        let newDir = path.join(`BACSDirectory/newBACS/${DirectoryDate}`)
        
        var output = fs.createWriteStream(`BACSDirectory/archivedBACS/${DirectoryDate}-BACS.zip`);

        var archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
        });

        output.on('close', function() {
        console.log("Yesterdays BACS have been archived.")   
        console.log(archive.pointer() + ' total bytes');
        resolve(savedBac)
        });

        output.on('end', function() {
        console.log('Data has been drained');
        });

        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
        });

        // good practice to catch this error explicitly
        archive.on('error', function(err) {
        throw err;
        });

        archive.pipe(output);
        
        archive.directory(newDir, false).finalize();
                
    });
}

const RetrieveBacsDocs = () => {
    return retrieveBacsFromDirectory()
        .then(readBacFiles)
        .then(parseBacFile)
        .then(saveBacToDB)
        .then(archiveProcessedBac)
        .then(bacSaved => {
            console.log(`${bacSaved.length} BACS have been logged to be processed - retrieve BACS Task now exiting...`);
        })
        .catch((err) => {
            console.log(`${err} - RetrieveBacsDocs task now exiting...`);
        })
}

module.exports = {RetrieveBacsDocs}