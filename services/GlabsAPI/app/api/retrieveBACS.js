const fs = require('fs'),
    xml2js = require('xml2js'),
    glob = require('glob'),
    moment = require('moment'),
    path = require('path'),
    {BacsDoc} = require('../models/bacsDocModel'),
    archiver = require('archiver'),
    AWS = require('aws-sdk')

let {BUCKET_NAME, BUCKET_NAME_NEW_BACS, BUCKET_NAME_ARCHIVED_BACS, IAM_USER_KEY, IAM_USER_SECRET} = require('../../../../secrets.js')

let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    Bucket: BUCKET_NAME_NEW_BACS
  });


const parser = new xml2js.Parser({explicitArray : false, ignoreAttrs : false, mergeAttrs : true});

const retrieveBacsFromAWSS3Bucket = () => {
  return new Promise ((resolve, reject) => {
    let params = { 
        Bucket: BUCKET_NAME,
        Delimiter: '',
        Prefix: 'newBacs/' 
    }
    s3bucket.listObjects(params, function (err, data) {
        if(err)throw err
        let allBacs = data.Contents.filter(content => content.Size > 0)
        
        let href = this.request.httpRequest.endpoint.href
        let bucketUrl = href + BUCKET_NAME + '/'

        let bacs = allBacs.map(function(bac) {
        let bacKey = bac.Key
        let bacUrl = bucketUrl + encodeURIComponent(bacKey)

        bac.url = bacUrl
        return bac
        })
        
        if (bacs.length > 0) {
            resolve(allBacs)
        } else {
            reject(`No new BACS found`)
        }
    })

  })
}

const readBacFiles = (retrievedBacs) => {   
    let bacs = retrievedBacs.map(bacfile => {
        return new Promise ((resolve, reject) => {
            let params = {Bucket: BUCKET_NAME, Key: bacfile.Key}

            s3bucket.getObject(params, function(err, json_data) {
                if (!err) {
                    resolve(json_data.Body.toString())
                }
           })
        })
    })

    return Promise.all(bacs)
}

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
            
            return bacsDocument.save().then(bac => {
                resolve(bac)
            })
        })
    })
    
    return Promise.all(savedBac)
}

const archiveProcessedBac = (savedBac) => {
    return new Promise((resolve, reject) => {
        return retrieveBacsFromAWSS3Bucket()
            .then(retrievedBacs => {
                let bacs = retrievedBacs.map(bacfile => {
                    return new Promise ((resolve, reject) => {
                        let params = {Bucket: BUCKET_NAME, Key: bacfile.Key}
            
                        s3bucket.getObject(params, function(err, json_data) {
                            if (!err) {
                                resolve(json_data.Body)
                            }
                       })
                    })
                })
            
                return Promise.all(bacs)
            })
            .then(result => {
                return new Promise((resolve, reject) => {
                    const DirectoryDate = moment().subtract(1, 'days').format('DD-MM-YYYY');
                    const directoryLocation = `BACSDirectory/archivedBACS/${DirectoryDate}-BACS.zip`
                    var output = fs.createWriteStream(directoryLocation)
            
                    var archive = archiver('zip', {
                    zlib: { level: 9 } // Sets the compression level.
                    })
            
                    output.on('close', function() {

                            fs.readFile(directoryLocation, function read(err, data) {
                                if (err) {
                                    throw err
                                }

                                let achriveKey = `${DirectoryDate}.zip`
                                s3bucket.createBucket(function () {
                                    var params = {
                                    Bucket: BUCKET_NAME_ARCHIVED_BACS,
                                    Key: achriveKey,
                                    Body: data
                                    };
                                    s3bucket.upload(params, function (err, data) {
                                    if (err) {
                                        console.log('error in callback')
                                        reject(err)
                                    }
                                    console.log('success')
                                    console.log(data)
                                    
                                    resolve(savedBac)
                                    })
                                })
                            })

        

                    })
            
                    output.on('end', function() {
                    console.log('Data has been drained')
                    })
            
                    // good practice to catch warnings (ie stat failures and other non-blocking errors)
                    archive.on('warning', function(err) {
                    if (err.code === 'ENOENT') {
                        // log warning
                    } else {
                        // throw error
                        throw err;
                    }
                    })
            
                    // good practice to catch this error explicitly
                    archive.on('error', function(err) {
                    throw err;
                    })
            
                    archive.pipe(output)
                    
                    archive.finalize()
                })
            })
            .then(savedBac => {
                console.log('this is saved')
                return resolve(savedBac)
            })
                
    })
}

const deleteArchivedBacsFromNewBACFolder = (savedBacs) => {
    return new Promise((resolve, reject) => {
        let params = { 
            Bucket: BUCKET_NAME,
            Delimiter: '',
            Prefix: 'newBacs/' 
        }
        let folderKey = 'newBacs'

        s3bucket.listObjects(params, function(err, data) {
          if (err) {
            console.log('There was an error deleting your album: ', err.message)
          }
          let oldBacs = data.Contents.filter(bac => bac.Size > 0)
          let objects = oldBacs.map(function(object) {
            return {Key: object.Key}
          })
          s3bucket.deleteObjects({
            Bucket: BUCKET_NAME,
            Delete: {Objects: objects, Quiet: true}
          }, function(err, data) {
            if (err) {
                console.log('There was an error deleting your album: ', err.message)
            }
            console.log('Successfully deleted album.')  
            resolve(oldBacs)
          })
        })

    })
    
}

const RetrieveBacsDocs = () => {
    return retrieveBacsFromAWSS3Bucket()
        .then(readBacFiles)
        .then(parseBacFile)
        .then(saveBacToDB)
        .then(archiveProcessedBac)
        .then(deleteArchivedBacsFromNewBACFolder)
        .then(savedBacs => {
            console.log(`${savedBacs.length} BACS have been logged to be processed - retrieve BACS Task now exiting...`)
            return savedBacs.length
        })
        .catch((err) => {
            console.log(`${err} - RetrieveBacsDocs task now exiting...`)
        })
}

module.exports = {RetrieveBacsDocs}
