const mongoose = require('mongoose'); // require mongoose pulls it in for our use

const Schema = mongoose.Schema; // we call on the 'mongoose' object we imported above and call on it's 'Schema' constructor

 // this is our new schema. We instantiate a schema object by calling new Schema using the constructor.
 // we then pass a JavaScript object where we define how we want our product to look.
const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: { // We store a userId based on type: which uses the schema Types object called ObjectId. Any object can have in ID so we specify that it is from our 'user' model we made in models/user.js. 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema); // mongoose will take the name 'Product', make it all lower case and automatically create this database collection on mongodb

// // in the next line we bring in the mongodb package so that we can use it to access our Object ID type below in findById.
// const mongodb = require('mongodb');

// // we have to access mongoConnect from the util folder database.js file. Using 'getDb' we can connect to our database with 'getDb' using the 'mongoConnect' function.
// const getDb = require('../util/database').getDb;

// // we create a class called Product which we export at the bottom of this file.
// class Product {
//   // first we construct our JavaScript object
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     // the next line is a ternary statement. It checks to see if a condition is true with the ? and if it is, it runs the next bit of code. If false, it runs what's after the colon ':'.
//     // so the next line says, if '?' 'id' has a value then run 'new mongodb.ObjectId(id)' if not ':' then fill with 'null'. The 'null' will be treated as false in our save() function below.
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   // This is how we save it in the database. This function can be executed on this class, 'Product'.
//   save() {
//     const db = getDb(); // getDb() simply returns that database instance we connected to with mongoConnect. So we have a connection with which to access the database.
//     let dbOp; // we create an empty variable that stands for databaseOperation.
//     // next if statement says, if 'this._id' has a value, execute the statement.
//     if (this._id) {
//       // Update the product
//       dbOp = db
//       .collection('products')
//       .updateOne({_id: this._id }, { $set: this }); // basically says update all 'this' values in this ObjectId
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return dbOp
//       .then (result => { // .then() method returns a promise that is either fulfilled (filled with data) or errors out.
//         console.log("'result' value from models/product.js. If it did something there should be a new ObjectId. Is there?", result);
//       })
//     .catch(err => {
//       console.log("err from models/product.js", err);
//     });
//   }

//   // the static method is used to call on the class itself. In this case it's calling on our 'Product' class at the top of this page.
//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .then(products => {
//         console.log(products);
//         return products;
//       })
//     .catch(err => {
//       console.log("err from models/product.js", err);
//     });
//   }
//  // the static method is used to call on the class itself. In this case it's calling on our 'Product' class at the top of this page.
//   static findById(prodId) {
//     const db = getDb();
//     return db.collection('products')
//     .find({_id: new mongodb.ObjectId(prodId) }) // this means find _id that equals the mongodb.ObjectId and store it in a string called (prodId) that we can use in our code as a string. We use the 'new' keyword as a constructor to creat an object (prodId) and set a value there.
//     .next() // we use next() to get the next (in this case the last and only) document returned by find()
//     .then(product => { // .then() method returns a promise that is either fulfilled (filled with data) or errors out.
//       console.log("value of 'product' from findById in models/product.js", product);
//       return product;
//     })
//     .catch(err => {
//       console.log("err from models/product.js", err);
//     });
//   }

//   // the static method is used to call on the class itself. In this case it's calling on our 'Product' class at the top of this page.
//   static deleteById(prodId) {
//     const db = getDb(); // calls on our database
//     // the following return calls the db, accesses our collection named 'products', says it wants to deleteOne()
//     // using the '_id' which is then found and turned into a value called 'prodId'.
//     return db
//     .collection('products')
//     .deleteOne({_id: new mongodb.ObjectID(prodId)})
//     .then(result => {
//       console.log('Product Deleted by deleteById in models/product.js.');
//     })
//     .catch( err => {
//       console.log("This err is from the 'deleteById' function in models/product.js", err);
//     });
//   }
// }

// module.exports = Product;
