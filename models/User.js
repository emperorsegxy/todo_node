const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const {Schema, model} = mongoose

const userSchema = new Schema({
    first_name: String,
    last_name: String,
    phone_number: String,
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
        const hash = await bcryptjs.hash(newUser.password, salt)
        const hashedNewUser = newUser
        hashedNewUser.password = hash
        console.log('::New user password successfully hashed')
        return hashedNewUser.save()
    } catch (e) {
        console.log(e)
        throw new Error(e)
    }
}

userSchema.statics.comparePassword = async function (userPassword, encryptedPassword) {
    try {
        return await bcryptjs.compare(userPassword, encryptedPassword)
    } catch (e) {
        throw e
    }
}

const User = model('User', userSchema)

module.exports = User
