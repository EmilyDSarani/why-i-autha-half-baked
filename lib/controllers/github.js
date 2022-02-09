const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const { sign } = require('../utils/jwt');
const GithubUser = require('../models/GithubUser');
const { exchangeCodeForToken, getGithubProfile } = require('../utils/github');
const ONE_DAY = 1000 * 60 * 60 * 24;

module.exports = Router()
  .get('/login', (req, res) => {
    res.redirect(
      //we find this link in the docs Dan provides, then we have our secret id and secret uri that we got from github
      //then we have to put the scope as user because the scope will default to empty for the users who are not authorized
      `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=user`
    );
  })
  .get('/login/callback', async (req, res, next) => {
    try{
      //get the code from the query
      const code = req.query.code;
      //pop code into the exchange token to get the access_token
      const githubToken  = await exchangeCodeForToken(code);
      //pop access token into the getGithubProfile and destructure what we need from it
      const { login, avatar_url, email } = await getGithubProfile(githubToken);
      //set user and do the if statement for if a user is logged in or not logged in
      let user = await GithubUser.findByUsername(login, avatar_url, email);
      if (!user){
        user = await GithubUser.insert({ username: login, avatar: avatar_url, email });
      }
      //MaxAge is in milliseconds and we only want it in http
      //also, the sign is coming from the JWT in the utils file
      res
        .cookie('session', sign(user), {
          httpOnly: true,
          maxAge: ONE_DAY,
        })
        //we have to look at where we are sending them, so looking at the test, we know we want to redirect them to a page that has the information that the test is looking for. 
        //for this specifically, that is our dashboard-- vs just the empty ('/') which we only have HTML there, but not the email, avatar, username.
        .redirect('/api/v1/github/dashboard');
    } catch (error){
      next(error);
    }
  })
  .get('/dashboard', authenticate, async (req, res) => {
    // require req.user
    // get data about user and send it as json
    res.json(req.user);
  })
  .delete('/sessions', (req, res) => {
    res
      .clearCookie(process.env.COOKIE_NAME)
      .json({ success: true, message: 'Signed out successfully!' });
  });
