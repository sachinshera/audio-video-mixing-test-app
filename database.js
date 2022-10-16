// init database

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';
const databaseName = 'mixingApp';
const client = new MongoClient(url, { useNewUrlParser: true });
const db = client.db(databaseName);
client.connect(function (err) {
    if (err) throw err;
    console.log("Database connected!");
});
// export database
module.exports = db;