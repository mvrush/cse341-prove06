/********* This is the Shop Controller  **************/

const Product = require('../models/product'); // we import the class 'Product' from the models folder product.js file. We use a capital starting character for classes, hence 'Product'.
// const Cart = require('../models/cart'); // import the class 'Cart' from the models folder cart.js file.

const Order = require('../models/order'); // we import our 'order' model.

exports.getProducts = (req, res, next) => {
    Product.find() // find is a mongoose function that will find all our products automatically and puts them in an array
    .then(products => {
      console.log("List of products from controllers/shop.js getProducts function", products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log("getProducts err from controllers/shop.js", err)
      const error = new Error(err);
      error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
      return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId) // Product is a mongoose model and findById is a mongoose method, all built-in.
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      console.log("findById err from controllers/shop.js", err)
      const error = new Error(err);
      error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
      return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
};

exports.getIndex = (req, res, next) => {
    Product.find() // find is a mongoose function that will find all our products automatically and puts them in an array.
        // this response says to render a view using the shop.ejs template file that's the 1st argument. The 2nd argument {} is a javascript object and it's filled with JavaScript wariables.
        // In the JavaScript object we map it to a key name which we can then use in the template to refer to a keyname to refer to the data we are passing in.
        // in the first line we use 'prods' as the keyword for the data from the 'products' const.
        .then(products => {
            console.log("List of Products called from getIndex in controllers/shop.js - ", products); // shows us all the objects in the array products
            res.render('shop/index', {
              prods: products,
              pageTitle: 'Shop',
              path: '/'
            });
          })
          .catch(err => {
            console.log("getIndex err from controllers/shop.js ->", err)
            const error = new Error(err);
            error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
            return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
          });
      };

exports.getCart = (req, res, next) => {
    req.user
    .populate('cart.items.productId') // mongoose function that populates the cart with items from the productId
    .then(user => { // we're working with the full user to we have to call the user data to get our cart items.
          const products = user.cart.items;
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          });


    })
    .catch(err => {
      console.log("Err from getCart in controllers/shop.js", err)
      const error = new Error(err);
      error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
      return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
};

// the following code pulls the productId from our post request when the Add-To-Cart button is pressed.
// it then looks at our 'Product' class and finds the 'product' associated with the 'prodId' and adds it to the cart.
// 'addToCart' in the models/user.js file is looking for the 'product' from here.
exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then(product => {
      return req.user.addToCart(product); // we use 'return' so it will continue to '.then()' and we can see the console.log of our result and be redirectec to the cart . We call 'addToCart' from our models/user.js  
    })
    .then(result => {
      console.log("This is the result of postCart in controllers/shop.js and also 'addToCart' in models/user.js", result);
      res.redirect('/cart'); // this redirects us to our cart view
    })
    .catch(err => {
      console.log("Err from 'postCart' in controllers/shop.js ->", err)
      const error = new Error(err);
      error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
      return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
 };

// the following is a POST command to delete an item in the cart
exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user // this 'req.user' holds our session user data which is defined in app.js
      .removeFromCart(prodId) // 'removeFromCart' called from models/user.js
      .then(result => {
        res.redirect('/cart');
      })
      .catch(err => {
        console.log("err from postCartDeleteProduct in controllers/shop.js", err)
        const error = new Error(err);
        error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
        return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
      });
  };

  exports.postOrder = (req, res, next) => {
    req.user // this 'req.user' holds our session user data which is defined in app.js
    .populate('cart.items.productId') // mongoose function that populates the cart with items from the productId
    .then(user => { // we're working with the full user to we have to call the user data to get our cart items.
      const products = user.cart.items.map(i => {
        // we actually have an array of elements where have the quantity and then the real product data was nested in a productId field.
        // we use the spread operator '...' on 'productId' and witn '_doc' we can access all the data the spread operator '...' pulls from 'productId'.
        return {quantity: i.quantity, product: { ...i.productId._doc } };
      });
        // we create a new 'order' object using the Order model we imported at the top of the page.
        const order = new Order({
        user: {
          email: req.user.email, // this requests the user email which is unique to each user. We could also use user ID if we wanted to.
          userId: req.user // this 'req.user' holds our session user data which is defined in app.js
        },
        products: products
      });
      return order.save();
    })
      .then(result => {
        return req.user.clearCart(); // here we return a request from the models/user.js the 'clearCart' method.
      })
      .then (() => {
        res.redirect('/orders'); // this .then() runs after clearing the cart to redirect us to the 'orders' view.
      })
      .catch(err => {
        console.log("err from postOrder in controllers/shop.js", err)
        const error = new Error(err);
        error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
        return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
  };

exports.getOrders = (req, res, next) => {
  // this looks for the 'user.userId' to be equal to 'req.user._id' in which req.user is our session user as defined in app.js. Basically finds all the orders for that userId.
  Order.find({ 'user.userId': req.user._id})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      console.log("err from 'getOrders' in controllers/shop.js ->", err)
      const error = new Error(err);
      error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
      return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
};
