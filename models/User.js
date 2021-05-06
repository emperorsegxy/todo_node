const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const {Schema, model} = mongoose

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

userSchema.statics.createUser = async function (newUser) {
    try {
        const salt = await bcryptjs.genSalt(10)
        console.log(salt)
        const hash = await bcryptjs.hash(newUser.password, salt)
        const hashedNewUser = newUser
        hashedNewUser.password = hash
        console.log(hashedNewUser)
        return hashedNewUser.save()
    } catch (e) {
        console.log(e)
        throw new Error(e)
    }
}

const User = model('User', userSchema)

module.exports = User
