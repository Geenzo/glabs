const http = require('http'),
  GlabsAPI = require('./GlabsAPI/config/app.js'),
  GlabsServer = http.Server(GlabsAPI),
  GlabsPORT = process.env.PORT || 3001,
  CronJob = require('cron').CronJob,
  {RetrieveBacsDocs} = require('./GlabsAPI/app/api/retrieveBACS.js'),
  {ReturnDebits} = require('./GlabsAPI/app/api/returnDebits.js'),
  io = require('socket.io')(GlabsServer)

  
  io.on('connection', function (socket) {
    console.log('socket io connected')
    
    socket.emit('news', { hello: 'world' })
    socket.on('my other event', function (data) {
      console.log('response back from client')
      
      console.log(data)
    })
  })  

  //Cron job to check for new BACs every minute
  new CronJob('* * * * *', function() {
    RetrieveBacsDocs()
      .then(numberOfBacs => {
        console.log('this is stuff')
        console.log(numberOfBacs)
        io.emit('Retrieve BACS', numberOfBacs)
        
      })
    console.log('Cron Job for Retrieving BACS has been triggered...')

  }, null, true, 'Europe/London')

  //Cron job to process BACs every 2 minute
  new CronJob('* * * * *', function() {
    ReturnDebits()
      .then(numberOfBacsProcessed => {
        console.log(numberOfBacsProcessed)  
        io.emit('Process BACS', numberOfBacsProcessed)
      })
    console.log('Cron Job for Processing BACS has been triggered...')

  }, null, true, 'Europe/London');


  GlabsServer.listen(GlabsPORT, () => console.log(`Glabs mongoDB running on ${GlabsPORT}`));
