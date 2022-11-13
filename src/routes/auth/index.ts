import express from 'express'
import type { RequestHandler } from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const router = express.Router()
const prisma = new PrismaClient()
const SALT_ROUNDS_BASE = process.env.SALT_ROUNDS || '10'
const SALT_ROUNDS = parseInt(SALT_ROUNDS_BASE)

type RequestWithJsonBody = {
  body: {
    email: string,
    password: string
  }
}

const validateAuthPost: RequestHandler = (req: RequestWithJsonBody, res, next) => {
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

router.post('/register', validateAuthPost, async (req: RequestWithJsonBody, res) => {
  const { email, password: plainTextPassword } = req.body
  const hashedPassword = await bcrypt.hash(plainTextPassword, SALT_ROUNDS)
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    })
    res.sendStatus(200)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') { // unique constraint violation
        return res
          .status(400)
          .send({
            message: "Can't create a user with this email"
          })
      }
    }
    throw e
  }
})

router.post('/login', validateAuthPost, async (req: RequestWithJsonBody, res) => {
  const { email, password } = req.body
  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })
    if (!user) {
      return res
        .status(400)
        .send({
          message: 'Please check your sign-in details'
        })
    }
    const result = await bcrypt.compare(password, user.password)
    if (!result) {
      return res
      .status(400)
      .send({
        message: 'Please check your sign-in details'
      })
    }
    return res
      .status(200)
      .send({
        user: {
          id: user.id
        }
      })
  } catch (e) {
    console.log(e)
    res
      .status(500)
      .send("There was a problem signing you in")
  }
})

export default router
