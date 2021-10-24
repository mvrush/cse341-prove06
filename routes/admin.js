// This is the route that handles the creation of products which the admin of our shop can do.

const path = require('path'); // require('path') is the 'path' core module in Express. We assign it to the constant names 'path'. It allows us to specify file paths and will even translate them for the users os whether that be Linux or Windows.

const express = require('express'); // Again we require express to be used on this page.

const { body } = require('express-validator'); // brings in 'express-validator' which is used to validate and sanitize input

const adminController = require('../controllers/admin'); // this brings our products.js controller into this file. It bundles all the exports from the products.js file for use in this file.

const isAuth = require('../middleware/is-auth'); // this brings in our 'is-auth.js' file from our middleware folder so we can use the const isAuth to check for logged in status.

const router = express.Router(); // We create the router constant to hold the 'express.Router()' function. Router() is an Express function that routes things.


// you always have to have the more specific middleware (i.e. '/add-product') before the less specific middleware (i.e. '/') because '/' will be true on all path requests.
// since we defined the 'router' const above, we now use 'router.use' instead of 'app.use'. Also the same arguments can be used such as 'use', 'post', 'get' or others.
// since we only want to use 'get' requests in this first one we use 'router.get'.
// The following line says "whenever we get a GET request for the route /add-product go ahead and execute the function 'getAddProduct' found in the productsController".
router.get('/add-product', isAuth, adminController.getAddProduct); // We use 'isAuth' first because the statement is read left to right and we want to check for an authorized user first. The path for the following will read as '/admin/add-product => GET' because we filtered for it in app.js

// We use 'isAuth' first because the statement is read left to right and we want to check for an authorized user first.
router.get('/products', isAuth, adminController.getProducts); // the path will read as '/admin/products => GET' because we filtered for it in app.js it automtically adds '/admin' because of our filter in app.js on line 34ish there.

// we use 'app.post' instead of 'app.use' because 'app.post' will only parse post requests. 'app.use' will parse both 'get' and 'post' requests. You can also use 'app.get' to parse only 'get' requests.
// The following line says "whenever we get a POST request for the route /add-product go ahead and execute the function 'postAddProduct' found in the productsController".
// we use the array [] to group our validation statements together. You don't have to use an array but it's convenient for organization.
// the path will read as '/admin/add-product => POST' because we filtered for it in app.js
router.post('/add-product',
[
    body('title') // calls our 'body' const above to use the 'express-validator' with the following values.
        .isAscii() // isAscii(str) is a built-in validator that only allows ascii letters, numbers and some special characters.
        .isLength({ min: 3 }) // sets the minimum length. Could also set max: length as well.
        .trim(), // trims out whitespace
    body('imageUrl').isURL(), // validates and sanitizes as a URL. Calls the 'body' const which brings in 'express-validator'.
    body('price').isFloat(), // calls the 'body' const above to use 'express-validator' and .isFloat() allows decimal numbers
    body('description')
        .isLength({ min: 5, max: 400 }) // calls the 'body' const from above on 'description' and sets length minimum and maximum.
        .trim()
],
    isAuth,
    adminController.postAddProduct
    );

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct); // a dynamic path segment is indicated by the colon ':'. We then call the adminController and execute the getEditProduct function.

// The next router.post doesn't have a dynamic segment so we use a POST route so data can be enclosed in the request we're sending. 
// The data will be the updated product info the user filled in. It calls eh postEditProduct function in the adminController.
router.post('/edit-product',
[
    body('title') // calls our 'body' const above to use the 'express-validator' with the following values.
        .isAscii() // isAscii(str) is a built-in validator that only allows ascii letters, numbers and some special characters.
        .isLength({ min: 3 }) // sets the minimum length. Could also set max: length as well.
        .trim(), // trims out whitespace
    body('imageUrl').isURL(), // validates and sanitizes as a URL. Calls the 'body' const which brings in 'express-validator'.
    body('price').isFloat(), // calls the 'body' const above to use 'express-validator' and .isFloat() allows decimal numbers
    body('description')
        .isLength({ min: 5, max: 400 }) // calls the 'body' const from above on 'description' and sets length minimum and maximum.
        .trim()
],
isAuth,
adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct); // calls the 'postDeleteProduct' function in the adminController.

module.exports = router; // This exports our express module named 'router'. 'router' is a const defined above which holds the 'express.Router()' module.
