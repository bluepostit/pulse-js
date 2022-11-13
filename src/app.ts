import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import auth from './routes/auth'

const { DEBUG } = process.env

const app = express()
app.use(express.json())

if (DEBUG) {
  app.use((req, _res, next) => {
    console.log(`${(new Date()).toLocaleString()} ${req.method} ${req.url}`)
    next()
  })
}

app.use('/api/auth', auth)

export default app

// helps jest tests
module.exports = app
