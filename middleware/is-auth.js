// This is our authorization verifier that is used to protect our routes to pages we don't want unlogged in users to access.

module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) { // checks to see if session.isLoggedIn is not (!) true. If not true then redirects to the login page. This is Route Protection to prevent an unlogged in user from manually typing the address.
        return res.redirect('/login'); // we 'return' this redirect to /login so the following next(); can't execute.
      }
    // if we make it past the check in the if statement above, we move on to next();
    next(); // this allows the next middlware to run without stopping here.
}