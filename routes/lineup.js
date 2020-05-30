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

    const goalkeeper = []
    const defenders = []
    const midfielders = []
    const forwards = []
    const subs = []

    players.forEach((player) => {
      if (player.position == 'Goalkeeper' && player.playing == true) {
        goalkeeper.push(player)
      } else if (player.position == 'Defender' && player.playing == true) {
        defenders.push(player)
      } else if (player.position == 'Midfielder' && player.playing == true) {
        midfielders.push(player)
      } else if (player.position == 'Forward' && player.playing == true) {
        forwards.push(player)
      } else {
        subs.push(player)
      }
    })
    res.json({
      goalkeeper: goalkeeper,
      defenders: defenders,
      midfielders: midfielders,
      forwards: forwards,
      subs: subs,
      players: players,
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

// @route     PUT api/lineup
// @desc      Update starting lineup
// @ access   Private

router.put('/', auth, async (req, res) => {
  const { player1, player2 } = req.body
  try {
    updated1 = await Player.findOneAndUpdate(
      { name: player1.name },
      {
        playing: player1.playing,
      }
    )
    updated2 = await Player.findOneAndUpdate(
      { name: player2.name },
      {
        playing: player2.playing,
      }
    )
    res.json({ updated1, updated2 })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})
// Export router for use in server.js
module.exports = router
