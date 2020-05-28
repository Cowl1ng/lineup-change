const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')

//Bring in authorisation middleware to verify jwt
const auth = require('../middleware/auth')

// Bring in user schema
const User = require('../models/User')

// @route     GET api/auth
// @desc      Get logged in user
// @access    Private

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

// @route     POST api/auth
// @desc      Auth user & get token (Login)
// @access    Public

router.post(
  '/',
  [
    check('username', 'Please enter a username').exists(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    // If validation check gives errors give 400 status and display error
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, password } = req.body

    try {
      let user = await User.findOne({ username })

      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' })
      }

      // Sending user a json web token (jwt)
      const payload = {
        user: {
          id: user.id,
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
    } catch (error) {}
  }
)

// Export router for use in server.js
module.exports = router
