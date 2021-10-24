/********* This is the Admin Controller  **************/

const mongoose = require('mongoose'); // we require the mongoose package to enable our error handling arguments for database related errors (not totally sure on that. Has something to do with enabling 'throw new Error()' ).

const { validationResult } = require('express-validator'); // brings in 'express-validator' and puts it n the 'validationResult' function.

// we import the class from the models folder, the product.js file. We use a capital starting character for classes, hence 'Product'.
const Product = require('../models/product');


// this next functions exports 'getAddProduct' to our routes/admin.js file
exports.getAddProduct = (req, res, next) => {
    // res.render tells router.get to render our 'edit-product.ejs' page. Then it gives it a JavaScript object filled with keynames that have data assigned to them.
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product', // this is the path the user types in the browser address
        editing: false, // this sets the editing parameter to 'false' which means you will not be in 'editMode' as defined in getEditProduct so the 'Add Product' button is then displayed.
        hasError: false,
        errorMessage: null,
        validationErrors: [] // we start with an empty array when we 'get' the AddProduct page.
    });
};

// this next functions exports 'postAddProduct' to our routes/admin.js file
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req); // sends a request to 'validationResult' defined above holding our 'express-validation'. Looks for validation errors.
    
    if (!errors.isEmpty()) { // says look at 'error' which holds 'validationResult(req)', if isEmpty() is not (!) empty, then run this block.
      console.log("This is our 'postAddProduct errors array:", errors.array());
      return res.status(422).render('admin/edit-product', { // status(422) sends the '422 Unprocessable Entity' code. Means it was unable to process the contained instructions.
        pageTitle: 'Add Product',
        path: '/admin/edit-product',
        editing: false, // we set this to false because we are not editing and don't want to change anything.
        hasError: true,
        product: {
          title: title,
          imageUrl: imageUrl,
          price: price,
          description: description
        },
        errorMessage: errors.array()[0].msg, // gets the first element out of an array built from 'errors' which hods data from 'validationResult(req).
        validationErrors: errors.array() // gets the entire errors.array()
      });
    }
    
    // next lines create a new 'product' constant from the Product class with the product info in it. This is based on our Mongoose schema values.
    // the 'title:' is our schema, and 'title' is our value from the 'const title' above.
    const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.user // in mongoose it will look at the req.user and pull the _id from it automatically (req.user is defined in our app.js)
    });
    product.save().then(result => { // the .save() is called from Mongoose we don't define it. Mongoose also gives us the .then() method. It's not technically a promise anymore.
      // console.log(result);
      console.log('From controllers/admin.js postAddProduct. It say...CREATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log("err from postAddProduct in controllers/admin.js", err);
      const error = new Error(err);
      error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
      return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
};


// this next functions exports 'getEditProduct' to our routes/admin.js file
exports.getEditProduct = (req, res, next) => {
    // res.render tells router.get to render our 'edit-product.ejs' page. Then it gives it a JavaScript object filled with keynames that have data assigned to them.
    const editMode = req.query.edit; // this says to look for a query in the url and look at the key/value pair for 'edit'. The key is 'edit' and if the value is 'true' then enable editing.
    if (!editMode) { // this says if it's not (!) editMode then send a response to redirect back to '/'.
        return res.redirect('/');
    }
    const prodId = req.params.productId; // this pulls the product id from the URL. That product id was added to the url in our routes/admin.js file on line 24.
    Product.findById(prodId) // Product is a mongoose model and findById is a mongoose method, all built-in. // (old note before Mongoose ->) here we reference our 'Product' class that we required at the top of this page from 'models/product' and we get our prodId from there.
    .then(product => {
     // throw new Error('Dummy Error'); // this is a fake error to test our error handling. Uncomment it to test.
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [] // loads an empty array when we 'get' the EditProduct page.
      });
    })
    .catch(err => {
       console.log("getEditProduct err from controllers/admin.js", err)
       const error = new Error(err);
       error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
       return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
};

exports.postEditProduct = (req, res, next) => {
    // the following const's pulls the hidden value for name="productId" out of our hidden input on the edit-product.ejs. name="whateverTheNameIs" on the rest of the consts.
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const errors = validationResult(req); // sends a request to 'validationResult' defined above holding our 'express-validation'. Looks for validation errors.
    
    if (!errors.isEmpty()) { // says look at 'error' which holds 'validationResult(req)', if isEmpty() is not (!) empty, then run this block.
      console.log("This is our 'postEditProduct errors array:", errors.array());
      return res.status(422).render('admin/edit-product', { // status(422) sends the '422 Unprocessable Entity' code. Means it was unable to process the contained instructions.
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true, // we set this to false because we are not editing and don't want to change anything.
        hasError: true,
        product: {
          title: updatedTitle,
          imageUrl: updatedImageUrl,
          price: updatedPrice,
          description: updatedDesc,
          _id: prodId // we HAVE to send the prodId again so the page loads properly when submitting an edit after an error.
        },
        errorMessage: errors.array()[0].msg, // gets the first element out of an array built from 'errors' which hods data from 'validationResult(req).
        validationErrors: errors.array() // when we post we want the entire errors.array(), not the empty we set we did the 'get' command.
      });
    }

    // We use mongoose Product and then the findById(prodId) tp fetch our 'product' which it brings in as a full mongoose object that gives us access to our mongoose functions. 
    // Using our mongoose .save() function it will save our changes to the existing product behind the scenes.
    Product.findById(prodId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()) { // if the product userId is not (!) equal to the req.user._id (the logged in user) then don't allow a product edit and send them to the homepage. We use 'toString()' to make sure we're comparing apples to apples.
          return res.redirect('/');
        }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save().then(result => { // we nested this .then block here so it wouldn't execute if they were redirected above. It used to be below this block.
        console.log('From controllers/admin.js postEditProduct. It say...UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
       console.log("err from 'postEditProduct' in controllers/admin.js ->", err)
       const error = new Error(err);
       error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
       return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
      });
};


exports.getProducts = (req, res, next) => {
  // With our Product.find() function we also use it to filter authorization to a specific userId. Limits what products can be seen in the Admin Products page.
  Product.find( {userId: req.user._id} ) // find() is a mongoose function that gives us all the documents. In it we put a filter and we ask it to only find products from a specific UserId found with 'req.user._id' which is defined in app.js in 'User.findById()'
  //  .select('title price -_id') // select() allows us to choose which data to display. So here we select the 'title', 'price' and with the minus '-' sign we tell it do not include the id. Commented out because we don't need it.
  //  .populate('userID') // populate() tells mongoose to populate a certain field with all the detail information and not just the ID. So it will look at 'userId' and gets all detail associated with that userId. Commented out because we don't need it.
    .then(products => {
      console.log("These are the products from our 'getProducts' function in the conrollers/admin.js file", products);
      res.render('admin/products', {
        prods: products, // keyname is 'prods' for the value of our 'products' array which is defined above with global scope. All the rest follow the same syntax.
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      console.log("err from 'getProducts' in controllers/admin.js ->", err)
      const error = new Error(err);
      error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
      return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
};


// the following exports deletes a product by calling the built-in 'findByIdAndRemove()' mongoose function.
exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne( {_id: prodId, userId: req.user._id} ) //uses the deleteOne() function and it deletes the prodId but only if the userId is equal to the req.user._id (the user who made the request).
    .then(() => {
      console.log('From controllers/admin.js postDeleteProduct. It say...DESTROYED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log("err generated from postDeleteProduct found in controllers/admin.js", err)
      const error = new Error(err);
      error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
      return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
};
