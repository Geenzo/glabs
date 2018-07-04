const models = require('../setup')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs') 
let AWS = require('aws-sdk')
let {BUCKET_NAME_NEW_BACS, IAM_USER_KEY, IAM_USER_SECRET} = require('../../../../secrets.js')

let s3bucket = new AWS.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET,
  Bucket: BUCKET_NAME_NEW_BACS
});

const uploadToS3 = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file.path, function (err, data) {
      s3bucket.createBucket(function () {
          var params = {
            Bucket: BUCKET_NAME_NEW_BACS,
            Key: file.name,
            Body: data
          };
          s3bucket.upload(params, function (err, data) {
            if (err) {
              console.log('error in callback')
              reject(err)
            }
            console.log('success')
            resolve(data)
          })
      })
    })
  })
}

module.exports = (app) => {

  app.route('/ReturnedDebitItems')
    .get((req, res) => {  
      models.BacsDocument.find({state: "Processed"}).then((returnDebits) => {
        let responseBody = {
          returnDebits: returnDebits,
          totalProcessedBacs: returnDebits.length
        }
        console.log(`Request for "/v1/ReturnedDebitItems" received - 200 response`)
        res.status(200).send(responseBody)
      }, (err) => {
        console.log(`Request for "/v1/ReturnedDebitItems" received - 200 response`)
        res.status(400).send(err)
      });
   })

   app.route('/UploadBAC')
    .post((req, res) => {  

      let today = new Date()
      let dd = today.getDate()-1
      let mm = today.getMonth()+1 

      let yyyy = today.getFullYear()
      if(dd<10){
          dd='0'+dd
      } 
      if(mm<10){
          mm='0'+mm
      } 

      let yesterday = dd+'-'+mm+'-'+yyyy

      let yesterdaysDirectoryPath = path.join(__dirname, `../../../../BACSDirectory/newBACS/${yesterday}`)

      //Create directory if does not exist yet
      if (!fs.existsSync(yesterdaysDirectoryPath)) {
        fs.mkdirSync(yesterdaysDirectoryPath)
      }

      let form = new formidable.IncomingForm()
      let statusCode = 200

      form.parse(req)
      
      form.on('fileBegin', function (name, file){
          file.path = `${yesterdaysDirectoryPath}/${file.name}`
      })

      form.on('file', function (name, file){
          console.log('Uploaded ' + file.name);
          
          uploadToS3(file)
            .then(result => {
              console.log('this is result');
              console.log(result);
              return res.status(200).json({
                upload: "Success"
              })
            })
            .catch(err => {
              console.log(err.message)
              return res.status(422).send({
                upload: "Failed",
                reason: err.message
              })
            })

      })

  })

}
