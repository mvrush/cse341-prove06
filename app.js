/************************
  This is the completed app.js we finished for the 'Working with Dynamic Content & Adding Templating Engines' module
 *************************/
// The following lines basically write your own server. Console.log is what causes it to log down there in the terminal window.

const path = require('path'); // Helps us construct a path that will work on all operating systems.

const express = require('express'); // this imports Express.js so we can use express. 

const bodyParser = require('body-parser'); // this constant stores the 'body-parser' function that we added usng 'npm install --save body-parser' . It's used to extract user entered data from the body.
 
const mongoose = require('mongoose');

require('dotenv').config(); // brings in 'dotenv' so we can use our API key with .env files. Installed with 'npm install --save dotenv'.

const session = require('express-session'); // this brings in the 'express-session' module which we installed using 'npm install --save express-session' to control our session data.

const MongoDBStore = require('connect-mongodb-session')(session); // brings in the 'connect-mongodb-sesson' module we installed using 'npm install --save connect-mongodb-session' to connect session data to our database. We pass the 'session' const to it from the previous line and it's all stored in const MongoDBStore.

const csrf = require('csurf'); // brings in 'csurf' which is our token system we use to validate our views. It prevents Cross-Site Request Forgery attacks.

const flash = require('connect-flash'); // brings in 'connect-flash' module which gives us the ability to give user feedback with error messages temporarily rendered in our views. Was installed with 'npm install --save connect-flash'.

const errorController = require('./controllers/error'); // this brings our error.js controller into this file. It bundles all the exports from the error.js file for use in this file.

const User = require('./models/user'); // brings in our User class from the models/user.js

const MONGODB_URI = 'mongodb+srv://matt:L4sQRk6keymsprU6@cluster0.uxlfb.mongodb.net/shop?retryWrites=true&w=majority'; // this is our connection the MongoDB server

const app = express(); // this constant which you can name whatever you want, stores the express() function. That is how we use express. This app is a valid request handler.

//TO RUN ON HEROKU: the following line overrides our typical port:3000 setting so we can deploy this to Heroku
const PORT = process.env.PORT || 5000; // So we can run on heroku || (OR) localhost:5000

// we initialize a new store with 'const store' which is filled by executing MongoDBStore as a constructor.
// for values we use the MONGODB_URI which is our database connection. We also create a new collection in the Database called 'sessions'.
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// we intialize our Cross-Site Request Forgery protection calling on the csrf const which holds our 'csurf' module.
const csrfProtection = csrf(); // we are going to use the session protecion using the session default values so we just use the csrf() function.

app.set('view engine', 'ejs'); // 'app.set' sets a global config value. In this case it's saying that the dynamic view engine is 'ejs'.
app.set('views', 'views'); // this 'app.set' sets the dynamic views folder. The first 'views' means look for views in the second value, 'views', which is the folder. You can use a folder named something other than 'views'. Also, if you leave the second value out, the default is to a folder called 'views'.


const adminRoutes = require('./routes/admin'); // this is the absolute path to our admin.js file in the routes folder.

const shopRoutes = require('./routes/shop'); // this is the absolute path to our shop.js file in the routes folder.

const authRoutes = require('./routes/auth'); // this is the absolute path to our auth.js file in the routes folder.

// 'use' allows us to add a new middleware function (middleware is like a code plugin). You have to use the 'next' value at the end of your use() function to move past it's section on to the next function.
// or you need to send a response 'res' if you don't need to move the 'next' middleware. The '/' is the path for the function. If you want it to go to a different page you would type '/pagename' .
// the order that you put these functions is very important because they're always read top to bottom.

app.use(bodyParser.urlencoded({extended: false})); // uses the 'bodyParser' const to use the 'body-parser' function. The line marks it as deprecated for some reason. This has to be placed before the page routes.

// The following line allows us to serve static files from our 'public' folder. It's called 'static' and it ships with express. It ultimately gives the 'public' folder read only access.
// we basically call 'static' from 'express' then we use 'path.join' to show a path to our 'public' folder. '__dirname' is the root folder of our project and then it finds the 'public' folder in there.
app.use(express.static(path.join(__dirname, 'public')));

// THE NEXT MIDDLEWARE SETS THE SESSION. It executes as a function that passes a JavaScript object where we configure the session setup.
// we set the 'secret' which is used for signing the hash which secretely stores our ID in the cookie. You can use any phrase, the longer the better.
// We set 'resave' to false which means that the session will not be saved on every request that is done. Only if something has changed in the session.
// We set 'saveUninitialized' to false which ensures no session gets saved for a request where it doesn't need to be saved because nothing was changed in the session.
// We set the 'store' to 'store' which is our 'const store' from earlier on the page which holds our MongoDBStore info which is our session info.
app.use(
  session({ 
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

// We now add our Cross-Site Request Forgery (csrf) protection. Must be enabled after the session is set
app.use(csrfProtection);
// we then add connect-flash which must also be added after the session is set. We connect it as a function called flash(). Connect-flash allows us to display user feedback like error messages.
app.use(flash());

// In the following middleware we setup our Cross-Site Request Forgery protection for use in all our views.
// for every request that is executed the following two 'locals.' fields 'isAuthenticated' and 'csrfToken' will be set for the veiws that are rendered.
app.use((req, res, next) => {
  // ExpressJS gives us a special field called the 'locals' field. It allows us to set local variables that are passed into the views. They're called local because they'll only exist in the views which are rendered.
  res.locals.isAuthenticated = req.session.isLoggedIn; // the req pulls the session 'isLoggedIn' data and passes it to the res.locals.isAuthenticated
  res.locals.csrfToken = req.csrfToken(); // req pulls the csrfToken from the csrfToken() function and adds it as a locals. variable.
  next(); // next(); allows us to continue
});

// The next middleware is super important. It sets up our 'user' from the session so that the user persists across requests.
// That way in our controllers admin.js and shop.js files when we call req.user, it knows that we are using the req.user from here which holds the session user.
app.use((req, res, next) => {
  // throw new Error('Sync Dummy Error'); // used for error testing
  if (!req.session.user) { // this gets the user out of the sessions and also says if no req.session.user then just go to the next middleware.
    return next(); // we use 'return' so that the code following it will not be executed and next(); will send it to the next middleware.
  }
  User.findById(req.session.user._id) // we then finf the 'user' by '_id' in the database and store the found user in the req object (req.user) a couple lines below.
  .then(user => {
    // throw new Error('ASync Dummy Error'); // used for error testin.
    if (!user) { // in this if we're being extra careful to avoid errors (error handling) and check again, if there's no user object, go to the next middleware.
      return next();
    }
    req.user = user; // we get back a mongoose model user which we store in req.user. This req.user is used in controllers admin.js and shop.js whenever req.user is called.
    next(); // we call next so that the incoming requests can continue with the next middleware.
  })
  // this error won't fire if we don't find a user with the _id, but it will fire for technical issues like if the database is down or
  // if the user of this app doesn't have sufficient permissions to execute this action.
  // (I used to run this to find errors before applying advanced error handling with 'throw'.) .catch(err => console.log("err from 'findById' middleware defining req.session.user._id in app.js", err));
  .catch(err => {
    next(new Error(err)); // In asnynchrounous code we use next instead of throw so that this is detected by Express. So, inside of 'promise', 'then' or 'catch' blocks inside of callbacks you have to use 'next'.
  });
});

// again, order matters. So list 'shopRoutes' second because it is calling our '/' page and that '/' exists in all addresses.
// We list 'authRoutes' third because if there is no leading filter (like we use '/admin' in adminRoutes), every request will go into our shopRoutes
// and anything not found in shopRoutes will go to authRoutes.
app.use('/admin', adminRoutes); // uses the 'adminRoutes' constant as an object, not a function, to use our admin.js file in the routes folder. I added '/admin' to this statement so that it will attach /admin to the path of the pages in admin.js, this is how we filter routes.

app.use(shopRoutes); // uses the 'shopRoutes' constant as an object to use our shop.js file in the routes folder.

app.use(authRoutes); //uses the 'authRoutes' constant as an object to use our auth.js file in the routes folder.

// the following line is used when we have a bigger error like our database is down or we have some other server error. It's called from places in our code where we need to show an error occured.
app.get('/500', errorController.get500); // calls the 'get500' function from our 'errorController'.

// The following line handles everything that our code and routes aren't programmed to do. It's kind of like a catch-all line. We use 'app.use' to handle all http methods, not just GET or POST.
// We can use '/' in this line but that's the default anyway so we don't need to use it.
app.use(errorController.get404);

// the next is a special middleware for errors and has the 'error' argument. It's our Error Handling Middleware.
// it gets moved to right away when you call 'next' with an 'error' passed to it like this 'next(error)'
// in our code when you see 'next(error)' this is the middleware it comes to.
app.use((error, req, res, next) => {
  // when it gets to this middlware it throws the 500 page instead of the detailed error data I log in the console.
  // res.redirect('/500'); // We don't want to redirect or we'll have in infinite loop if the error is in a syncrhonous block. Use the following lines.
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
  console.log("app.js caught this error from somewhere else! ->", error); // we console log the 'error' argument from app.use for troubleshooting.
});

mongoose.connect(
  MONGODB_URI // this is our constant from earlier on this page that connects to the MongoDB server
  )
  .then(result => {
    // NEXT LINE CHANGED TO CONNECT USING HEROKU   old line was 'app.listen(3000);'
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  })
  .catch(err => {
    console.log("Err from mongoose.connect in /app.js file", err);
  });


// we execute the mongoConnect function here which connects us to our database. SUPERCEDED WITH MONGOOSE
// mongoConnect(() => {
//   app.listen(3000); // this line brings up our node server
// });

// The following commented out app.listen(3000); was apparently superceded during our database modules.
// app.listen(3000); // this uses Express (through the app const) to start the server and listen to port 3000. It basically creates our server using Express.