const jwt = require('jsonwebtoken'); 


const sign = (signed) => {
  return jwt.sign({ ...signed }, process.env.JWT_SECRET, {
    expiresIn: '1 day',
  });
};

module.exports = {
  sign
};
