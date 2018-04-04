const models = require('../setup')

module.exports = (app) => {

  app.route('/v1/ReturnedDebitItems')
    .get((req, res) => {  
      models.BacsDocument.find({state: "Processed"}).then((returnDebits) => {
        console.log(`Request for "/v1/ReturnedDebitItems" received - 200 response`);
        res.status(200).send({returnDebits});
      }, (err) => {
        console.log(`Request for "/v1/ReturnedDebitItems" received - 200 response`);
        res.status(400).send(err);
      });
   })

}
