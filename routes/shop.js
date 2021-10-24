// This is the portion of the shop that users will see.

const path = require('path'); // require('path') is the 'path' core module in Express. We assign it to the constant names 'path'.

const express = require('express'); // Again we require express to be used on this page.

const shopController = require('../controllers/shop'); // Creates a constant that pulls in our products.js controller.

const isAuth = require('../middleware/is-auth'); // this brings in our 'is-auth.js' file from our middleware folder so we can use the const isAuth to check for logged in status.

const router = express.Router(); // We create the router constant to hold the 'express.Router()' function. Router() is an Express function that routes things.

// even though I have the less specific '/' before the more specific 'add-product' this middleware uses 'next()' to pass along to the next middleware. So it won't stop here.
// the middlewares that use 'next()' to add functionality need to be placed before those that send a response of they'll never be reached.
// the 'app' constant was changed to the 'router' constant so I switced from 'app' to 'router'. I am also using 'get' instead of 'use' so it only watched 'get' commands (although I could use 'use' instead and that's ok).
router.get('/', (req, res, next) => {
    console.log("This always runs because it ends in a next() and is placed before the responses, called from routes/shop.js, it's a router.get function.");
    next();
});

router.get ('/', shopController.getIndex); // Says for the '/' page request go to the Shop Controoler and use 'getIndex'.

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct); // the colon (:) tells the express.Router() that everything after the colon is a Dynamic Segment (it changes). This is important to remember because the code will stop executing here when looking at routes to the 'products' page. 
// // Everything after products/ would be considered to fall under Dynamic Segment. So if you had a path to 'products/delete' you would need to list it before the Dynamic Segment line. The more specific routes go before the dynamic route in our code. 
// // Also, the name 'productId' is the name by which you extract the data using 'params' in our shop.js contoller.

// We use 'isAuth' first because the statement is read left to right and we want to check for an authorized user first.
router.get('/cart', isAuth, shopController.getCart); // calls the getCart function from the shopController. All these router.post's do the same. They call a function from some controller.

router.post('/cart', isAuth, shopController.postCart); // calls the postCart function from the shopController. All these router.post's do the same. They call a function from some controller.

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

module.exports = router; // This exports our express module named 'router'. 'router' is a const defined above which holds the 'express.Router()' module.