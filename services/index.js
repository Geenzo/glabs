const http = require('http'),
  GlabsAPI = require('./GlabsAPI'),
  GlabsServer = http.Server(GlabsAPI),
  GlabsPORT = process.env.PORT || 3001,
  LOCAL = '0.0.0.0';

  GlabsServer.listen(GlabsPORT, LOCAL, () => console.log(`Glabs mongoDB running on ${GlabsPORT}`));
