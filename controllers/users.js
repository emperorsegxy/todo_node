const express = require('express')
const User = require('../models/User')
const route = express.Router()

route.get('/users', (req, res, next) => {
    res.send('These are all the users!')
})

route.get('/user/:id', (req, res, next) => {
    console.log(req.params.id)
    res.send('We got a user')
})

route.post('/user', async (req, res) => {
    console.log('User about to be created..');
    const {name, email, password} = req.body
    console.log({name, email, password})
    console.log(await isUserExisting(email), 'lol, what\'re you?')
    if (await isUserExisting(email)) {
        res.status(400)
        res.json({message: 'user already exists'})
        return
    }
    let newUser = new User({name, email, password})
    // newUser.save((error, user) => {
    //     if (error) return
    //     res.send(user)
    // })
    newUser = await User.createUser(newUser)
    console.log(newUser)
    res.status(201).json({message: 'User successfully created', user: newUser})
})

route.delete('/users/:id', async (req, res) => {
    const {id} = req.params
    try {
        const user = await User.findById(id)
        if (user) {
            user.remove()
            res.json({message: "User successfully deleted"})
        } else {
            res.status(404)
            res.json({message: "User not found. We find am, we no see am."})
        }
    } catch (e) {
        res.status(404)
        res.json({message: "User not found."})
    }
})

const isUserExisting = async email => {
    const user = await User.findOne({email}).exec()
    console.log('b4 ch', user)
    return !!user;
}

module.exports = route