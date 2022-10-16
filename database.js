// init database
//t8vb1Ogd6Oa0WQTr
//sachin
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = `mongodb+srv://sachin:t8vb1Ogd6Oa0WQTr@cluster0.9tvqwmp.mongodb.net/?retryWrites=true&w=majority`;
const databaseName = 'mixingApp';
const client = new MongoClient(url, { useNewUrlParser: true });
const db = client.db(databaseName);
client.connect(function (err) {
    if (err) throw err;
    console.log("Database connected!");
});
// export database
module.exports = db;