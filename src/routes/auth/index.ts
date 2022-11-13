import express from 'express'
import type { RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const router = express.Router()
const prisma = new PrismaClient()
const SALT_ROUNDS = 10

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

router.post('/register', validateRegistration, async (req, res) => {
  const { email, password: plainTextPassword } = req.body
  const hashedPassword = await bcrypt.hash(plainTextPassword, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword
    }
  })
  console.log(user)
  res.sendStatus(200)
})

export default router
