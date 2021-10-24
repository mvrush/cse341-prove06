// this file is called from app.js to connect us to our mongodb server.

const mongodb = require('mongodb'); // this require gives us access to the mongodb package and stores it in a constant called mongodb
const MongoClient = mongodb.MongoClient; // this is the Mongo Client constructor pulled from the mongodb package and assigned to the conts MongoClient.

// in the next constant the underscore before db in '_db' means that this variable will only be used internally in this file. It is undefined until the function below fills it.
let _db;

// the following 'const mongoConnect' is a method (a method is an anonymous function that can be called from other parts of the code) that connects to our mongodb.
const mongoConnect = (callback) => {

// this is all we have to type to connect to mongodb. It uses the URL from our mongodbAtlas cluster page with user and password. I actually replaced 'MyFirstDatabase?' with 'shop?' in the URL so it would automatically create our shop database as soon as we start writing data to it.
// it returns a .then() .catch() promise which either returns an error or says we're connected.
MongoClient.connect('mongodb+srv://matt:L4sQRk6keymsprU6@cluster0.uxlfb.mongodb.net/shop?retryWrites=true&w=majority'
)
  .then(client => {
    console.log('Database Connected!');
    _db = client.db() // this stores a value in the '_db' variable. I could write 'client.db(test)' and override 'shop' in our URL but we leave it blank to use 'shop' in our URL.
    callback(); // this callback used to send the result of our connection, stored in 'client' back up to our 'mongoConnect' const (callback). But now it's just blank
  })
  .catch(err => {
    console.log(err);
    throw err; // the throw statement throws a user-defined exception. Execution of the current function will stop and statements after 'throw' won't be executed. Control will be passed to the first 'catch' block in the call stack. If no 'catch' block exists among caller functions the program will terminate.
});
};

const getDb = () => {
  if (_db) {
    return _db; // says "if the _db variable is filled then return access to client.db".
  }
  throw 'No database found!'; // for more info on 'throw' just search 'JavaScript throw'.
};

exports.mongoConnect = mongoConnect; // this exports our mongoConnect method to other parts of our code. It connects and stores the connection to the database.
exports.getDb = getDb; // exports our getDb function which returns access to the connected database. This allows mongoDb to manage many simultaneous connections.
