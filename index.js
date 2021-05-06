const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const fs = require('fs')
const mongoose = require('mongoose')

const app = express()

// connecting to the db
mongoose.connect('mongodb://127.0.0.1:27017/nodejs_prac', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => console.log('secured'))
// mongoose.onerror((e) => console.log(e, 'o ti sele oooo.'))
// mongoose.once(() => console.log('database connection is secured'))

app.use(morgan('combined'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const PORT = 4000

fs.readdirSync('controllers').forEach(file => {
    console.log(file)
    if (file.substr(-3) === '.js') {
        const route = require(`./controllers/${file}`)
        app.use(route)
    }
})

app.get('/', (req, res, next) => {
    res.status(200)
    res.send('It works')
})

app.listen(PORT, () => console.log('server runnaing ' + `http://localhost:${PORT}`))