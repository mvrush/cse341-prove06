const mongoose = require('mongoose'); // import Mongoose

const Schema = mongoose.Schema; // this is the Mongoose schema package built in to mongoose

// the next lines define our user schema. The cart: holds an embedded document with info about the cart. It's an array of documents.
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  restTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // the type: field calls from the Schema, uses a 'Types' field where we can pull different objects. ref: 'Product' refers to the ObjectId in the Product model.
        quantity: { type: Number, required: true }
      }
    ]
  }
});

// we user our userSchema and add a method key called 'methods' and that will allow us to add our own method which is 'addToCart'.
// we then create it as a function and we have to use a function so that the 'this' keyword still works and refers to this schema.
userSchema.methods.addToCart = function (product) {
    // this looks for the product.Id in the cartProductIndex. 
    // it then adds one to the quantity of the quantity found in the cartProductIndex.
    // if no product already exists in the cart it adds newQuantity of 1 by default so it's basically added to the cart.
    const cartProductIndex = this.cart.items.findIndex( cp => {
      return cp.productId.toString() === product._id.toString(); // we use toString() so that we are sure to compare the productId to product._id as a string.
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items]; // the spread operator '...' creates a new array with all the cart items
    // the if statement says, if there is a product in there, add one to it and update the newQuantity.
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else { // this says, if there are no products, push this added product with quantity 1 to the updatedCartItems array.
      updatedCartItems.push ({
        productId: product._id,
        quantity: newQuantity
      });
    }
    // the updatedCart const holds a JavaScript object. We use 'new' command to create an 'ObjectId' that has the 'product._id' in it.
    // We only want 'product._id' so that if we edit the product info, those changes are also reflected in the cart. 
    // And then we use the comma ',' to add the 'quantity: 1' property to 'product' and we set it to 1.
    const updatedCart = {
      items: updatedCartItems
    };
    this.cart = updatedCart; // we set cart = to the updatedCart.
    return this.save(); // and then we simply save 'this'.
  };

  // the 'removeFromCart' is a method we create using the 'userSchema.methods' protocol for creating our own method.
  // it's the same way we did 'addToCart' above using a function.
  userSchema.methods.removeFromCart = function (productId) {
    // we user filter() which is a JavaScript method that allows us to define criteria on how we want to filter the elements in the 'items' array.
    // then it will return a new array with all the filtered items.
    const updatedCartItems = this.cart.items.filter( item => {
    return item.productId.toString() !== productId.toString(); // we want to return false '!==' to get rid of the item. So we end up with an array of all the items except the one we wanted removed.
  });
  this.cart.items = updatedCartItems; // we set updatedCartItems = this.cart.items
  return this.save(); // then we simply save 'this'
  };

  // here we create a new method called 'clearCart' to clear the cart. We use the 'methods' key on 'userSchema' to created thise method which is actually a function.
  // in the function we basically create a cart with an empty array using 'this.cart' and then we return it and 'save()' 'this'.
  userSchema.methods.clearCart = function () {
    this.cart = {items: []};
    return this.save();
  }

module.exports = mongoose.model('User', userSchema); // mongoose will change 'User' to 'users' when it creates it in the database.

// const mongodb = require('mongodb'); // get the mongodb module
// const getDb = require('../util/database').getDb; // we pull in access to our database

// const ObjectId = mongodb.ObjectId; // we will use this 'ObjectId' to store our converted string from 'userId' below.

// // We create a JavaScript class called User. Class names have a capital first letter
// class User {
//   // the constructor() function takes arguments that will build our data for this class
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart; // cart will be an object with some items, like this: {items: {}}
//     this._id = id;
//   }

//  // This is how we save it in the database. This function can be executed on this class, 'User'.
//  save() {
//   const db = getDb(); // getDb() simply returns that database instance we connected to with mongoConnect. So we have a connection with which to access the database.
//   let dbOp; // we create an empty variable that stands for databaseOperation.
//   // next statement says, on the 'db' constant which is our database reach out to a 'collection' called 'users' and
//   // insertOne new element which is the JavaScript object created above called 'this' and return it.
//   return db.collection('users').insertOne(this);
// }

//   addToCart(product) {


//   getCart() {
//     // this code allows us to return a fully populated cart with all the product details
//     const db = getDb(); // gets our database
//     // next line uses the JavaScript function map() to map all the id's in the cart and puts all those id's in an array.
//     const productIds = this.cart.items.map(i => {
//       return i.productId;
//     });
//     // this next line finds all products in the cart using a special query syntax mongodb supports.
//     // it says, find '_id' where. And we then pass an object with a special mongodb query operator called '$in'
//     // which looks for all elements where the '_id' is one of the id's mentioned in the 'productIds' array.  
//     return db
//     .collection('products')
//     .find({_id: { $in: productIds } })
//     .toArray() // pushes all the productIds to an array
//     .then(products => { // has all the product data for the products that are in the cart
//       return products.map(p => { // map() takes a function that executes on every element and products and describes how to transform this element.
//         return { // we return a new value which is an object where we still have all the old product properties.
//           ...p, // the ...p gives us all the old product properties.
//           quantity: this.cart.items.find( i => { // we have a new 'quantity' property that reaches out to cart.items which exist on that user
//             return i.productId.toString() === p._id.toString(); // it uses find() to match the 'productId' in the cart with the 'p._id' in the database.
//           }).quantity // from the cart items we have we need to extract a .quantity for the given product.
//         };
//       });
//     });
//   }

//   deleteItemFromCart(productId) {
//     // we user filter() which is a JavaScript method that allows us to define criteria on how we want to filter the elements in the 'items' array.
//     // then it will return a new array with all the filtered items.
//     const updatedCartItems = this.cart.items.filter( item => {
//     return item.productId.toString() !== productId.toString(); // we want to return false '!==' to get rid of the item. So we end up with an array of all the items except the one we wanted removed.
//   });
//   const db = getDb(); // gets our database
//   // the next three lines pulls the 'users' collection from the database and using updateOne() it
//   // overides the updatedCart value into the cart for the _id of that user.
//   // It simply overides the old Cart with the updatedCart value.
//   return db
//   .collection('users').updateOne(
//     {_id: new ObjectId(this._id) },
//     {$set: {cart: {items: updatedCartItems} } } 
//   );
//   }

//   addOrder() {
//     const db = getDb(); // We call our database
//     // we call our getCart() function to get the detailed data from the cart and we use .then() to work with the data that getCart() gives us.
//     // the wariable 'products' has all our product data in it from the 'products' collection.
//     return this.getCart()
//     .then(products => {
//       // we create a new const called 'order' that has our user id associated with the order and we store the user name.
//       const order = {
//         items: products,
//         user: {
//           _id: new ObjectId(this._id),
//           name: this.name
//         }
//       };
//       return db.collection('orders').insertOne(order) // We return the mongodb collection called 'orders' and use the insertOne() function to insert the user's order.
//     })
//     .then (result => { // .then after we insert the cart we return the cart with an empty array. We also clear it in the database in collection 'users' by returning an empty cart array there as well.
//       this.cart = {items: []};
//     return db
//     .collection('users')
//     .updateOne(
//     {_id: new ObjectId(this._id) },
//     {$set: {cart: { items: [] } } } 
//     );
//   });
// }

//   getOrders() {
//     const db = getDb(); // we get our mongodb database
//     // Next line basically looks in the 'orders' collection, finds the JSON field 'user' and then '_id'. That's why we use quotes around 'user._id'.
//     // It then compares the 'user._id' found in the 'orders' collection with the new ObjectId(this._id) and we'll get all orders for that ID and sends them to an array.
//     return db.collection('orders')
//     .find({'user._id': new ObjectId(this._id)})
//     .toArray(); 
//   }

//    // the static method is used to call on the class itself. In this case it's calling on our 'Product' class at the top of this page.
//    static findById(userId) {
//     const db = getDb(); // accesses our database
//     // The next return block means findOne '_id' from our 'ObjectId' from our ObjectId const above and store it in a string called (userId) that we can use in our code as a string. 
//     // We use the 'new' keyword as a constructor to create an object (userId) and set a value there.
//     // We user findOne because we know we will only find one otherwise we need to use the .find() and .next() method.
//     return db.collection('users').findOne({_id: new ObjectId(userId) })
//     .then(user => {
//       console.log("Our user object logged from findById in models/user.js", user);
//       return user;
//     })
//     .catch(err => {
//       console.log("This err from findById in models/user.js", err)
//     });
//   }

// }


// module.exports = User;
