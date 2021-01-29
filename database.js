// db.js

// mongodb driver
const MongoClient = require("mongodb").MongoClient;
const dotenv = require('dotenv');
dotenv.config();


// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://test1:<password>@cluster0.y62uh.mongodb.net/<dbname>?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
  
const dbConnectionUrl = "mongodb+srv://" + process.env.NOSQL_USERID + ":" + process.env.NOSQL_PASS + "@cluster0.y62uh.mongodb.net/" + process.env.NOSQL_DBNAME + "?retryWrites=true&w=majority"

function initialize(
    dbName,
    dbCollectionName,
    successCallback,
    failureCallback
) {
    MongoClient.connect(dbConnectionUrl, { useUnifiedTopology: true }, function (err, dbInstance) {
        if (err) {
            console.log(`[MongoDB connection] ERROR: ${err}`);
            failureCallback(err); // this should be "caught" by the calling function
        } else {
            const dbObject = dbInstance.db(dbName);
            const dbCollection = dbObject.collection(dbCollectionName);
            console.log("[MongoDB connection] SUCCESS " + dbCollectionName);

            successCallback(dbCollection);
        }
    });
}

module.exports = {
    initialize
};