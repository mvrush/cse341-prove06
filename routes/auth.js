// these are the routes that handle authentication
const express = require('express'); // brings in express for use on this page

// check is a subpackage of express-validator. To the left of = we use a JavaScript object. We use curly braces for destructuring and we use the 'check' property to run a check.
// 'check' checks the body, the parameters, the query parameters etc. You can have 'check on it's own or to get more specific add a comma after check and specify what you want checked.
// here we say check the body only.
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth'); // brings in the 'auth.js' file from controllers and calls it 'authController'.

const User = require('../models/user'); // brings in our User model for this page.

const router = express.Router(); // brings in express's Router module

// this route gets our login.ejs view
router.get('/login', authController.getLogin); // has router use a 'get' method to use the 'getLogin' function from the authController.

router.get('/signup', authController.getSignup); // has router use a 'get' method to use the 'getSignup' function from the authController.

// we will insert an array [] that has our validation info for the postLogin function. We don't have to use an array but it's handy for organization.
router.post('/login', [
    body('email') // gets the email from our login.ejs view
        .isEmail() // checks to see if it's a valid email
        .withMessage('<div class="user-message user-message--error"><p>Please enter a valid email address.</p></div>') // you can use .withMessage() after each validator. If it's not an email it sends this message
        .normalizeEmail(), // this is the way we santize emails. It removes extra whitespace and it makes it all lower case.
        body('password', '<div class="user-message user-message--error"><p>Password must be valid.</p></div>') // first argument gets the password from our login.ejs view. 2nd argument is our error message. We did this one here instead of using .withMessage() like we did above. 
        .isLength({ min: 12 }) // checks to see if it's 12 characters long
        .isAlphanumeric() // allows letters and numbers
        .trim() // santizing, we trim the password to remove excess white space.
        //.withMessage('Please enter a valid email address.') // we could have used .withMessage() here but instead we put the error message as an argument in the body() call.  
], authController.postLogin); // has router use a 'post' method to use the 'postLogin' function in the authController.

// has router use a 'post' method to use the 'postSignup' function in the authController.
// check() is a middleware using express-validator to validate user input. We add the field name 'isEmail()' we want to check.
// express-validator then uses it's built-in isEmail() function to check that the email is valid.
router.post('/signup',
[ // we wrap this in an array [] to make it clear that this block is all about validation. We don't have to do wrap in an array if we don't want to.
check('email') // when we only specify 'check()' it checks the body, the headers, the parameters, the query parameters etc.
    .isEmail() // this is a validator function that validates the email the user enters. (we can chain multiple validators).
    .withMessage('Please enter a valid email.') // the 'withMessage()' function is chained and puts the message in the errors array when we get an error in our controllers/auth.js postSignup function.
    .custom((value, { req }) => { // we originally chained this custom validator to the commented out filter for an unallowed email address. And this is how we could filter unallowed passwords as well.
    /*********************THIS IS HOW WE WERE VALIDATING EMAIL (then we changed it) ***************
    //     if (value === 'test@test.com') {
    //         throw new Error('This email address is forbidden.');
    //     }
    //     return true;
    ******************************************************************************/
    // validates the 'value' from '.custom((value, { req })' and the value is 'email' as defined with 'check('email')' above.
    return User.findOne({ email: value })
    // this is an asynchronous way to validate because by returning a promise to the following .then block, Express will wait until the database is checked for the email.
    .then(userDoc => {
      if (userDoc) { // this if statement is inside of the above .then block. Every .then block implicitely returns a new promise.
        return Promise.reject('E-Mail already exists. Either <a href="/login">Login</a> or choose a different one.'); // Promise is a built-in JavaScript object and with .reject we basically throw an error inside the Promise.
        }
    });
})
    .normalizeEmail(), // sanitizing. We sanitize the email to remove extra whitespace and make it all lower case.
    // in the following we tell it to only check the 'body' for a password and then make sure it validates using the parameters we specified.
    // it also passes the message when an error occurs. The second value is the message.
    body(
        'password',
        'Please enter a password with only numbers, special characters and text that is at least 12 characters.'
    )
        .isLength({ min: 12 }) // sets our minimum password length to 4
        .isAlphanumeric() // sets the password to alphanumeric only. Can also chain with a dot (.) and specify special characters as well.
        .trim(), // sanitizing. Trim removes excess whitespace.
    body('confirmPassword')
        .trim() // sanitize. We remove excess whitespace from our confirmPassword as well to be sure it matches our password.
        .custom((value, { req }) => { // this is a .custom validator the value looks and see's if the value of password is not (!) equal to the password it pulled from the req.body.
        if (value !== req.body.password) {
            throw new Error('Passwords do not match, please re-enter.');
        }
        return true;
    })
], authController.postSignup
);

router.post('/logout', authController.postLogout); // has router use a 'post' method to use the 'postLogin' function in the authController.

router.get('/reset', authController.getReset); // this is the 'get' route to using the 'getReset' function in the authController.

// this is the 'post' route using the 'postReset' function in the authController.
router.post('/reset', authController.postReset); 

router.get('/reset/:token', authController.getNewPassword); // The path is /reset/:token and :token is a dynamic parameter that holds the unique token for a reset. This is the 'get' route using the 'getNewPassowrd' function in the authController.

// this is the 'post' route using the 'postNewPassword' function in the authController.
router.post('/new-password', authController.postNewPassword);

module.exports = router;