import express from 'express'
import type { RequestHandler } from 'express'
import bcrypt from 'bcrypt'

const router = express.Router()

type RequestWithJsonBody = {
  body: {
    email?: String,
    password?: String
  }
}

const validateRegistration: RequestHandler = (req: RequestWithJsonBody, res, next) => {
  const { email, password } = req.body
  if (!email) {
    return res
      .status(400)
      .send({
        message: 'Missing email'
      });
  }

  if (!password) {
    return res
      .status(400)
      .send({
        message: 'Missing password'
      })
  }

  next()
}

router.post('/register', validateRegistration, (req, res) => {
  res.sendStatus(200)
})

export default router
