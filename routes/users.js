const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')

// Bring in user schema
const User = require('../models/User')

// @route     POST api/users
// @desc      Register a user
// @access    Public

router.post(
  '/',
  [
    check('name', 'Please include a name').not().isEmpty(),
    check('username', 'Please include a valid username').not().isEmpty(),
    // check(
    //   'password',
    //   'Please enter a password with 6 or more characters'
    // ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    // If validation check gives errors give 400 status and display error
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // De-structure req.body
    const { name, username, password } = req.body

    try {
      // Search to see if username already in database and give error if there
      let user = await User.findOne({ username })
      if (user) {
        return res.status(400).json({ msg: 'User already exists' })
      }

      // Create new user model from body data
      user = new User({
        name,
        username,
        password,
      })

      // Generate salt & hash password
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)

      // Save user to database
      await user.save()

      // Sending user a json web token (jwt)
      const payload = {
        user: {
          id: user.id,
          name: user.name,
        },
      }

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: config.get('jwtExpiresIn'),
        },
        (error, token) => {
          if (error) throw error
          res.json({ token })
        }
      )
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Server error')
    }
  }
)

// Export router for use in server.js
module.exports = router
