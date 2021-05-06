const {createErrorResponseObject} = require("../helpers/error_helper");

const express = require('express')
const User = require('../models/User')
const route = express.Router()

//authentication
const passportJWT = require('passport-jwt')
const jwt = require('jsonwebtoken')

const ExtractJWT = passportJWT.ExtractJwt
const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderWithScheme('jwt')
jwtOptions.secretOrKey = 'user_login_secret_key-unguessable'

route.get('/users', (req, res, next) => {
    res.send('These are all the users!')
})

route.get('/user/:id', (req, res, next) => {
    console.log(req.params.id)
    res.send('We got a user')
})

route.post('/user', async (req, res) => {
    console.log('::A new registration detected..');
    const {name, email, password} = req.body
    if (await isUserExisting(email)) {
        return res.status(400).json(createErrorResponseObject('user already exists'))
    }
    let newUser = new User({name, email, password})
    newUser = await User.createUser(newUser)
    console.log(`::New user with email: ${email} successfully created..`)
    res.status(201).json({message: 'User successfully created', user: newUser})
})

route.post('/user/login', async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email}).exec()
        if (!user) {
            console.log("::User is not found")
            return res.status(404).json(createErrorResponseObject("User does not exist."))
        }
        if (!await User.comparePassword(password, user.password)) {
            console.log("::User entered a wrong password")
            return res.status(400).json(createErrorResponseObject("Password does not match with provided email address"))
        }
        console.log("::User is authenticated")
        const payload = { id: user.id }
        const token = jwt.sign(payload, jwtOptions.secretOrKey)
        console.log(`::Token ${token} is signed to user ${user.id}`)
        res.status(200).json({message: "Login successful", token})
    } catch (e) {
        console.log(e, e.message)
        res.status(500).json(createErrorResponseObject("There was a problem. Please try again later!"))
    }
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
    return !!await User.findOne({email}).exec()
}

module.exports = route