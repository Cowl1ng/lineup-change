const jwt = require('jsonwebtoken')
const config = require('config')

// Bring in user schema
const User = require('../models/User')

module.exports = async function (req, res, next) {
  //Get token from header
  const token = req.header('x-auth-token')

  // Check is token exists
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorisation denied' })
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'))

    // Decoding the users ID
    userID = decoded.user

    // Getting all the users information and putting it in req.user for other functions to call
    req.user = await User.findById(userID.id)

    next()
  } catch (error) {
    return res.status(401).json({ msg: 'Token is not valid' })
  }
}
