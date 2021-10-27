/********* This is the Authorization Controller  **************/
const crypto = require('crypto'); // crypto is a built-in Node.js crypto library. It helps us generate unique, secure random values.

const bcrypt = require('bcryptjs'); // imports bcryptjs so that we can use it's encryption features.

const nodemailer = require('nodemailer'); // imports the 'nodemailer' module for sending emails. Installed with npm install --save nodemailer

const sendgridTransport = require('nodemailer-sendgrid-transport'); // imports 'nodemailer-sendgrid-transport' for using SendGrid for email. Installed with npm install --save nodemailer-sendgrid-transport

const { validationResult } = require('express-validator'); // we use 'validationResult' from the 'express-validator/check' package to gather all the errors prior validation middleware (like the one in routes/auth.js) might have thrown or stored.

const User = require('../models/user'); // imports our user model and assigns it to the 'User' const.

// We initialize a transporter useing nodemailer, the createTransport() method and the sendgridTransport() function. In there we pass an auth: object that has our api info.
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.API_KEY
  }
}));

// console.log("This is a list of all our environment variables ->", process.env);

// this is our 'getLogin' function. It is a response and it renders the login view from views/auth/login.ejs
exports.getLogin = (req, res, next) => {
  let message = req.flash('error'); // sets our message variable using our 'flash' package with the value of 'error'. 'message' is then used as the value of 'errorMessage' in our res.render below.
  if (message.length > 0) { // says if the message length is greater than 0 (which means we have a message)...
    message = message[0]; // set the message in element [0] of the array (the first position).
  } else { 
    message = null; // if message length is 0 then set message to null.
  }
    console.log("If you're logged into a session, then 'true'. If not, then 'undefined'.", req.session.isLoggedIn); // this shows in our console whether we are logged into a session or not.
      res.render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: message,
          oldInput: { // this is used for making our user input sticky. For 'getLogin' we have the fields blank so they are not rendered on the page.
            email: '',
            password: ''
          },
          validationErrors: [] // we set an empty array to hold validation errors if they occur.
        });
  };

// This is our 'getSignup' function that renders our signup view.
exports.getSignup = (req, res, next) => {
  let message = req.flash('error'); // sets our message variable using our 'flash' package with the value of 'error'. 'message' is then used as the value of 'errorMessage' in our res.render below.
  if (message.length > 0) { // says if the message length is greater than 0 (which means we have a message)...
    message = message[0]; // set the message in element [0] of the array (the first position).
  } else { 
    message = null; // if message length is 0 then set message to null.
  }
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: message,
      oldInput: { // this is used for making our user input sticky. For 'getSignup' we have the fields blank so they are not rendered on the page.
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      validationErrors: [] // we set an empty array to hold validation errors if they occur.
    });    
  };

// this is our 'postLogin' function. It get's our login fields from our 'login.ejs. view and sets a header for our cookie.
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req); // this gathers all the errors collected by this package.
    // next if statement says if errors is not (!) empty using the isEmpty() function to check, return the res with status 422 (means validation failed) and render login page.
  if (!errors.isEmpty()) {
    console.log("This is our errors array from 'postLogin'", errors.array()); // shows us what's in the errors.array()
  return res.status(422).render('auth/login', { // we return this so the code starting at User.findOne does not execute. // status(422) sends the '422 Unprocessable Entity' code. Means it was unable to process the contained instructions.
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg, // we pull the first item in the array and pull the 'msg' property from it to display our message
      oldInput: { // this is used for making our user input sticky. For 'postLogin' we have the JS Object filled with the constants defined in 'postLogin'.
        email: email,
        password: password
      },
      validationErrors: errors.array() // this returns the full array of errors and we can access them with our 'validationErrors' definition.
    });
  }

    User.findOne({ email: email }) // We know we will only have one email per user so we use the findOne() function.
    .then(user => {
      if (!user) { // if no (!) user is found we redirect them to the login page. But first we flash a message...
        return res.status(422).render('auth/login', { // we return this so the code starting at User.findOne does not execute. // status(422) sends the '422 Unprocessable Entity' code. Means it was unable to process the contained instructions.
          path: '/login',
          pageTitle: 'Login',
          errorMessage: '<div class="user-message user-message--error"><p>Invalid Email or Password</p></div>', // shows this error message when an error occurs. It contains raw html.
          oldInput: { // this is used for making our user input sticky. For 'postLogin' we have the JS Object filled with the constants defined in 'postLogin'.
            email: email,
            password: password
          },
          validationErrors: [] // create an empty array so it just flashes the message saying Invalid Email or Password and doesn't specify which failed. (not as graceful as the signup page)
        });
      }
      // if a user is found we execute the following using bcrypt to match the password.
      bcrypt
        .compare(password, user.password)// This compares the entered 'password' with the 'user.password' in the database to see if they match. It returns a promise so we add a .then and .catch block.
        .then(doMatch => {
          if (doMatch) {
            console.log("You have been logged in by the controllers/auth.js 'postLogin' function!");
            req.session.isLoggedIn = true;  // req the 'session' object which was added by our session middleware. We create a key called 'isLoggedIn' (we can use any name we want) and set it to true.
            req.session.user = user; // this sets the 'session' user equal to 'user'. By setting the user on the session we share it across all requests.
            return req.session.save(err => { // We return this to avoid execution of the res.redirect('/login') line follwing this block. This block tells it to save the session before redirecting so that the database is sure to have written the session before redirecting. (this is only required for timing issues where the page rendering depends on the session being written in the database).
              console.log("if there's an err from postLogin password compare in controllers/auth.js it will be defined: ", err);
              res.redirect('/'); // we don't return this line becuase it's part of the .save() function.
            });
          }
          return res.status(422).render('auth/login', { // we return this so the code starting at User.findOne does not execute. // status(422) sends the '422 Unprocessable Entity' code. Means it was unable to process the contained instructions.
            path: '/login',
            pageTitle: 'Login',
            errorMessage: '<div class="user-message user-message--error"><p>Invalid Email or Password</p></div>', // shows this error message when an error occurs. It contains raw html.
            oldInput: { // this is used for making our user input sticky. For 'postLogin' we have the JS Object filled with the constants defined in 'postLogin'.
              email: email,
              password: password
            },
            validationErrors: [] // create an empty array so it just flashes the message saying Invalid Email or Password and doesn't specify which failed. (not as graceful as the signup page)
          });
        })
        .catch(err => { // on this .catch we don't use the 'newError(err)' because we are redirecting instead of throwing a 500 page.
          console.log("err from postLogin in controllers/auth.js", err);
          res.redirect('/login'); // if there is an err then we get redirected back to login instead of throwing a 500 error.
        });
      
    })
    .catch(err => {
      console.log("err from postLogin at controllers/auth.js", err)
      const error = new Error(err);
      error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
      return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
};

// this stores a new user in our database.
exports.postSignup = (req, res, next) => {
  let message = req.flash('error'); // sets our message variable using our 'flash' package with the value of 'error'. 'message' is then used as the value of 'errorMessage' in our res.render below.
  if (message.length > 0) { // says if the message length is greater than 0 (which means we have a message)...
    message = message[0]; // set the message in element [0] of the array (the first position).
  } else { 
    message = null; // if message length is 0 then set message to null.
  }
  // these lines pull the data from our signup.ejs view. They match the fields in models/user.js in our User schema.
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req); // const errors collects any errors found in 'validationResult' that is a const at the top of this page.
  // next if statement says if errors is not (!) empty using the isEmpty() function to check, return the res with status 422 (means validation failed) and render a page.
    if (!errors.isEmpty()) {
      console.log("This is our errors array from 'postSignup'", errors.array()); // shows us what's in the errors.array()
      return res.status(422).render('auth/signup', { // status(422) sends the '422 Unprocessable Entity' code. Means it was unable to process the contained instructions.
          path: '/signup',
          pageTitle: 'Signup',
          errorMessage: errors.array()[0].msg, // looks at the errors.array() and pulls out the first object and from the pulls the 'msg' value. We could pull the 'param' value for more detail.
          oldInput: { // we use this to send the email and password constants and the confirmPassword data (pulled from the body request) back to the page to render due to an error. It makes it sticky.
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            confirmPassword: req.body.confirmPassword // we have to pull this one from the body because it's not defined as a const.
          },
          validationErrors: errors.array() // this returns the full array of errors and we can access them with our 'validationErrors' definition.
        });
    }
    // this is how we encrypt our password. It calls our 'bcrypt' const from earlier on this page.
    // it then uses the hash() function which accepts arguments. The first says to hash our 'password'.
    // The second is the SALT value. It specifies how many rounds of hashing to create a secure password.
    // Higher numbers take longer but they are more secure. 12 is generally accepted as highly secure.
    // It is an asynchronus request so it gives us back a prmoise so we return it and then create a block to get our hashed password.
    bcrypt
    .hash(password, 12) 
    // if there is no existing user we execute the following block to create a new user. It uses the 'User' Schema defined in models/user.js
    .then(hashedPassword => {
      const user = new User({ // calls our User schema from models/user.js
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save(); // saves our data in the user const to the database.
    })
    .then(result => {
      req.flash('error', '<div class="user-message"><p>Successfully signed up! Please login:</p></div>'); // flashes the message using our flash method setup in app.js. First value 'error' is a key that matches what we used in the 'postSignup' in this block, the second value is the message that gets flashed.
      res.redirect('/login'); // we then redirect the user to the login page because after signing up they'll need to login.
      // we redirect and then call our 'transporter' content to send a confirmation email using the following method.
      return transporter.sendMail({ // we return this so that the code ends here when this is true.
        to: email, // sends to our email constant defined above.
        from: 'mvrush@hotmail.com',
        subject: 'Signup succeeded!',
        html: '<h1>You successfully signed up!</h1>'
      });      
    })
    .catch(err => {
      console.log("err from our email 'sendMail' in controllers/auth.js", err)
      const error = new Error(err);
      error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
      return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
};

// this is our 'postLogout' function. It activates when the Logout button is selected and clears the session.
exports.postLogout = (req, res, next) => {
  // "requests" from our "session" module the "destroy()"" function which is provided by the session package we're using.
  req.session.destroy(err => {
    console.log("if there's an err from controllers/auth.js 'postLogout', here it is -> ", err); // logs error if we get one.
    console.log("You have been logged out by the controllers/auth.js 'postLogout' function!");
    res.redirect('/'); // after destroying the session we are redirected back to the '/' page.
  }); 
};

// This is our reset password function to call the reset password view.
exports.getReset = (req, res, next) => {
  let message = req.flash('error'); // sets our message variable using our 'flash' package with the value of 'error'. 'message' is then used as the value of 'errorMessage' in our res.render below.
  if (message.length > 0) { // says if the message length is greater than 0 (which means we have a message)...
    message = message[0]; // set the message in element [0] of the array (the first position).
  } else { 
    message = null; // if message length is 0 then set message to null.
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

// the 'postReset' export is for when the user clicks the 'Reset Password' button
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => { // uses crypto and the randomBytes() function to create a 32-byte either error or buffer(err, buffer).
    if (err) { // if an error it displays the error
      console.log("err from 'postReset', 'crypto.randomBytes' function in controllers/auth.js", err);
      return res.redirect('/reset'); // if no error we will have a valid buffer and we are redirected to the /reset page.
    }
    const token = buffer.toString('hex'); // we then pass the buffer to a string and we convert it from 'hex' to ASCII and store in the const token.
    User.findOne({ email: req.body.email }) // findOne looks for an email in the database that matches the email entered by the user in our reset.ejs view.
    .then(user => {
      if (!user) { // if no (!) user found it flashes an error message and redirects to the /reset page.
      req.flash('error', 'No account with that email found');
      return res.redirect('/reset');
     // return Promise.reject("On line 182ish 'Promise.reject' No account with the email found"); // since there was an error this makes it so the next .then block doesn't execute. Another solution is to nest the next .then block right after return user.save().
      }
      user.resetToken = token; // else if a user set the user.resetToken = to the token we generated above.
      user.resetTokenExpiration = Date.now() + 3600000; // and give user.resetTokenExpiration the value of the date right now plus one hour which = 3600000 milliseconds
      return user.save().then(result => { // updates our user in the database with the values in resetToken and resetTokenExpiration and runs the .then block
        res.redirect('/');
         transporter.sendMail({ // when we successfully save the user info in the database we send an email with this function
          to: req.body.email, // sends to our email entered by user in the reset.ejs view.
          from: 'mvrush@hotmail.com',
          subject: 'Password Reset',
          // in the next line we are using backticks `` to write multiple lines of HTML code and also put variables in there
          html: `
          <p>You requested a password reset.</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          <p>Link expires in one hour!</p>
          `
        });  
    })
    // THIS THEN BLOCK WOULD CAUSE ERRORS UNTIL I MOVED IT INTO THE BLOCK ABOVE SO IT WOULDN'T EXECUTE UNLESS THE SAVE() WAS REACHED.
    // .then(result => {
    //   res.redirect('/');
    //    transporter.sendMail({ // when we successfully save the user info in the database we send an email with this function
    //     to: req.body.email, // sends to our email entered by user in the reset.ejs view.
    //     from: 'mvrush@hotmail.com',
    //     subject: 'Password Reset',
    //     // in the next line we are using backticks `` to write multiple lines of HTML code and also put variables in there
    //     html: `
    //     <p>You requested a password reset.</p>
    //     <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
    //     <p>Link expires in one hour!</p>
    //     `
    //   });      
    })
     .catch(err => {
     console.log("err from 'postReset' in controllers/auth.js while finding and sending user email", err)
     const error = new Error(err);
     error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
     return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token; // pulls the token from our params and assigns it to const token.
  User.findOne ({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }) // $gt means 'greater than'. So greater than Date.now().
  .then(user => {
    let message = req.flash('error'); // sets our message variable using our 'flash' package with the value of 'error'. 'message' is then used as the value of 'errorMessage' in our res.render below.
    if (message.length > 0) { // says if the message length is greater than 0 (which means we have a message)...
      message = message[0]; // set the message in element [0] of the array (the first position).
    } else { 
      message = null; // if message length is 0 then set message to null.
    }
/**************Following block removed when activating password validation ******************  
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(), // we are resetting a specific userId's password so we need to find it.
      passwordToken: token, // holds the value of 'token' from our const token above and is used in our new-password.ejs view
    });
*****************************************************************************************************/  
  res.render('auth/new-password', {
    path: '/new-password',
    pageTitle: 'New Password',
    errorMessage: message,
    userId: user._id.toString(), // we are resetting a specific userId's password so we need to find it.
    passwordToken: token, // holds the value of 'token' from our const token above and is used in our new-password.ejs view
    oldInput: { // this is used for making our user input sticky. For 'getLogin' we have the fields blank so they are not rendered on the page.
      password: ''
    },
    validationErrors: [] // we set an empty array to hold validation errors if they occur.
  });

})
  .catch(err => {
    console.log("err from getNewPassword in controllers/auth.js", err)
    const error = new Error(err);
    error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
    return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
  });
};

// postNewPassword pulls the data out of our new-password.ejs view
exports.postNewPassword = (req, res, next) => {
/*START VALIDATION FLASH MESSAGE LINES*******************************/  
  let message = req.flash('error'); // sets our message variable using our 'flash' package with the value of 'error'. 'message' is then used as the value of 'errorMessage' in our res.render below.
  if (message.length > 0) { // says if the message length is greater than 0 (which means we have a message)...
    message = message[0]; // set the message in element [0] of the array (the first position).
  } else { 
    message = null; // if message length is 0 then set message to null.
  }
/*END VALIDATION FLASH MESSAGE LINES********************************************/
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

/******START VALIDATION LINES. Following lines starting with 'const errors' added during validation installation */
const errors = validationResult(req); // this gathers all the errors collected by this package.
if (!errors.isEmpty()) {
  console.log("This is our errors array from 'postNewPassword' in controllers/auth.js", errors.array()); // shows us what's in the errors.array()
return res.status(422).render('auth/new-password', { // we return this so the code starting at User.findOne does not execute. // status(422) sends the '422 Unprocessable Entity' code. Means it was unable to process the contained instructions.
    path: '/new-password',
    pageTitle: 'New Password',
    userId: userId, // have to add userId to the render so that inputs on 'new-password.ejs' work.
    passwordToken: passwordToken, // have to add passwordToken to the render so that inputs on 'new-password.ejs' work.
    errorMessage: errors.array()[0].msg, // we pull the first item in the array and pull the 'msg' property from it to display our message
    oldInput: { // this is used for making our user input sticky. For 'postLogin' we have the JS Object filled with the constants defined in 'postLogin'.
      password: newPassword
    },
    validationErrors: errors.array() // this returns the full array of errors and we can access them with our 'validationErrors' definition.
  });
}
/*******END OF VALIDATION LINES*/

  let resetUser; // we set a variable with scope just in the postNewPassword function using 'let'. Then we can use it in multiple places in this function
  // after pulling the above const's from our new-password.ejs view we reset the password
  User.findOne({ // we look for one user that has the correct reset token and the correct token expiration and the userId.
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() }, // $gt means 'greater than'. So greater than Date.now()
    _id: userId
  })
  .then(user => {
    resetUser = user; // we assign the value for 'user' to our 'resetUser' variable we defined earlier in this function.
    // console.log(resetUser); // I used this console.log to verify that it was pulling my user data. I was getting a null when I wasn't pulling the token correctly.
    return bcrypt.hash(newPassword, 12); // this encrypts our newPassword with a SALT of 12 which is considered very secure
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined; // these fields are now undefined. We don't need to store any values in them.
    resetUser.resetTokenExpiration = undefined; // these fields are now undefined. We don't need to store any values in them.
    return resetUser.save(); // we then save the whole thing.
  })
  .then(result => {
/*ADDED FLASH ERROR LINE DURING VALIDATION SETUP*/
    req.flash('error', '<div class="user-message"><p>Password successfully changed! Please login:</p></div>'); // flashes the message using our flash method setup in app.js. First value 'error' is a key that matches what we used in the 'postNewPassword' in this block, the second value is the message that gets flashed.
    res.redirect('/login'); // this is the result of our .save from the previous .then() function. We could also put in code to flash a message that the reset was successful and/or even send a confirmation email.
  })
  .catch(err => {
    console.log("err from postNewPassword in controllers/auth.js", err)
    const error = new Error(err);
    error.httpStatusCode = 500; // we aren't using this line yet but it bascially sets the value for 'httpStatusCode' to 500.
    return next(error); // when we use next with error called as an argument, Express will skip all middlwares and move right to an error handling middleware (it's found in our app.js).
  });
};