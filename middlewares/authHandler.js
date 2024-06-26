const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = function (req, res, next) {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization
  if(authHeader){
    try {
      token = authHeader.split(" ")[1] //Bearer and space and then auth token so we are spliting with space and taken the second item
      if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
      }
      const decoded = jwt.verify(token, config.jwtSecret);
      if (decoded.admin) {
        req.admin = decoded.admin;
      } else if (decoded.customer) {
        req.customer = decoded.customer;
      }
      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }

  }
  
  
};
