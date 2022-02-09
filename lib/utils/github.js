const fetch = require('cross-fetch');

const exchangeCodeForToken = async (code) => {
  // we use this to fetch the github auth site which we can find in the docs that Dan provided
  const tokenRequest = await fetch('https://github.com/login/oauth/access_token', {
    //we want our method to be post, the headers to accept json
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    //then we want the body to come back stringy
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code, 
    })
  });
  // deconstruct the access_token, then we want to...await...? the token request as a json
  const { access_token } = await tokenRequest.json();
  //then return the access_token
  return access_token;

};

const getGithubProfile = async (token) => {
  // the url we get from the docs Dan provided
  const profileReq = await fetch('https://api.github.com/user', {
    headers:{
      //we want to accept an application in json format and authorize the token that we expect
      Accept: 'application/json',
      Authorization: `token ${token}`,
    }
  });
  //jsonify it and return
  const profile = await profileReq.json();
  return profile;
};

module.exports = { exchangeCodeForToken, getGithubProfile };
