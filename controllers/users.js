const {removeUnwantedProperties} = require("../helpers");

const {createErrorResponseObject} = require("../helpers/error_helper");
const _ = require('lodash')

const express = require('express')
const User = require('../models/User')
const route = express.Router()

//authentication
const passportJWT = require('passport-jwt')
const jwt = require('jsonwebtoken')
const UserTransfer = require("../transferModels/UserTransfer");

const ExtractJWT = passportJWT.ExtractJwt
const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderWithScheme('jwt')
jwtOptions.secretOrKey = 'user_login_secret_key-unguessable'

route.get('/users', (req, res, next) => {
    res.send('These are all the users!')
})

route.get('/api/user/:id', async (req, res, next) => {
    const {id} = req.params
    try {
        const user = await User.findById(id).exec()
        if (user) {
            return res.json(new UserTransfer(user))
        } else {
            return res.status(404).json(createErrorResponseObject("User is not found!"))
        }
    } catch (e) {
        console.log(e)
        res.status(500).json(createErrorResponseObject("Database error!"))
    }
})

route.post('/api/user', async (req, res) => {
    console.log('::A new registration detected..');
    const {first_name, last_name, email_address: email, password, confirm_password, phone_number} = req.body
    if (await isUserExisting(email)) {
        return res.status(400).json(createErrorResponseObject('user already exists'))
    }
    if (password !== confirm_password)
        return res.status(400).json(createErrorResponseObject("Passwords do not match."))
    let newUser = new User({first_name, last_name, email, password, phone_number})
    newUser = await User.createUser(newUser)
    console.log(`::New user with email: ${email} successfully created..`)
    res.status(201).json({message: 'User successfully created', user: new UserTransfer(newUser)})
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

route.delete('/user/:id', async (req, res) => {
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