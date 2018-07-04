module.exports = {
  secret: 'glabssecret',
  session: {
    session: false
  },
  database: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/glabsMongoDB'
}
