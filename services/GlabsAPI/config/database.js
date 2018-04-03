module.exports = (mongoose, config) => {
  const database = mongoose.connection;
  mongoose.Promise = Promise;

  mongoose.connect(config.database, {
    promiseLibrary: global.Promise
  });

  database.on('error', error => console.log(`Connection to Glabs database failed: ${error}`));

  database.on('connected', () => console.log('Connected to Glabs database'));

  database.on('disconnected', () => console.log('Disconnected from Glabs database'));

  process.on('SIGINT', () => {
    database.close(() => {
      console.log('Glabs terminated, connection closed');
      process.exit(0);
    })
  });
};
