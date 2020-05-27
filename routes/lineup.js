const express = require('express')
const router = express.Router()

// Bring in user schema
const User = require('../models/User')

// Bring in user schema
const Player = require('../models/Player')

//Bring in authorisation middleware to verify jwt
const auth = require('../middleware/auth')

// @route     GET api/lineup
// @desc      Get all players for the user
// @ access   Private

router.get('/', auth, async (req, res) => {
  try {
    const players = await Player.find({
      fantasy_team: req.user.fantasy_team,
    }).sort({ playing: -1 })
    res.json(players)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

// @route     PUT api/lineup
// @desc      Update starting lineup
// @ access   Private

router.get('/', auth, async (req, res) => {
  user = await User.findById(req.user._id)
})
// Export router for use in server.js
module.exports = router
