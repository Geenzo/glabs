const models = require('../setup')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs') 

module.exports = (app) => {

  app.route('/v1/ReturnedDebitItems')
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

   app.route('/v1/UploadBAC')
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
          if (fs.existsSync(`${yesterdaysDirectoryPath}/${file.name}`)) {
            console.log('file already exists');
            statusCode = 422
          }

          file.path = `${yesterdaysDirectoryPath}/${file.name}`
      })

      form.on('file', function (name, file){
          console.log('Uploaded ' + file.name);

          if(statusCode == 200) {
            return res.status(200).json({
              upload: "Success"
            })
          } else if (statusCode == 422){
            return res.status(422).send({
              upload: "Failed",
              reason: "File with this name had already been uploaded for yesterday, please upload a different file or change the name of the file."
            })
          }
      })

  })

}
