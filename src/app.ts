// const express = require('express')
import express from 'express'
import auth from './routes/auth'

const app = express()

app.use('/api/auth', auth)

export default app

// helps jest tests
module.exports = app
