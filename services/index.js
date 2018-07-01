const http = require('http'),
  GlabsAPI = require('./GlabsAPI/config/app.js'),
  GlabsServer = http.Server(GlabsAPI),
  GlabsPORT = process.env.PORT || 3001,
  LOCAL = '0.0.0.0',
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
    console.log('Cron Job for Retrieving BACS has been triggered...')
    io.emit('Retrieve BACS', 'Retrieve BACs CronJob has been triggered on server')

  }, null, true, 'Europe/London')

  //Cron job to process BACs every 2 minute
  new CronJob('*/2 * * * *', function() {
    ReturnDebits()
    console.log('Cron Job for Processing BACS has been triggered...')
    io.emit('Process BACS', 'Process BACs CronJob has been triggered on server')

  }, null, true, 'Europe/London');


  GlabsServer.listen(GlabsPORT, LOCAL, () => console.log(`Glabs mongoDB running on ${GlabsPORT}`));
