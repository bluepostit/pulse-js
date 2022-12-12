import express, { Request, RequestHandler } from 'express'
import { Prisma, PrismaClient, User } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt, { Secret } from 'jsonwebtoken'
import env from '../../env'

const router = express.Router()
const prisma = new PrismaClient()
const TOKEN_SECRET: Secret = env.TOKEN_SECRET
const { DEBUG, SALT_ROUNDS } = env

interface RequestWithJsonBody extends Request {
  body: {
    email: string
    password: string
  }
}

prisma.$use(async (params, next) => {
  if (params.model === 'User' && ['create', 'update'].includes(params.action)) {
    console.log(params.args.data)
    const password = params.args.data.password
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
      params.args.data.password = hashedPassword
    }
    console.log({ data: params.args.data })
    return await next(params)
  }
})

const validateAuthPost: RequestHandler = (
  req: RequestWithJsonBody,
  res,
  next
) => {
  const { email, password } = req.body
  if (!email) {
    return res.status(400).send({
      message: 'Missing email',
    })
  }

  if (!password) {
    return res.status(400).send({
      message: 'Missing password',
    })
  }

  next()
}

const generateToken = (user: User) => {
  const payload = {
    id: user.id,
  }
  return jwt.sign(payload, TOKEN_SECRET, {
    expiresIn: '14d',
  })
}

router.post(
  '/register',
  validateAuthPost,
  async (req: RequestWithJsonBody, res) => {
    const { email, password } = req.body
    try {
      const user = await prisma.user.create({
        data: {
          email,
          password,
        },
      })
      console.log(user)
      res.sendStatus(200)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          // unique constraint violation
          return res.status(400).send({
            message: "Can't create a user with this email",
          })
        }
      }
      throw e
    }
  }
)

router.post(
  '/login',
  validateAuthPost,
  async (req: RequestWithJsonBody, res) => {
    const { email, password } = req.body
    try {
      console.log('login info to try: ', { email, password })
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })
      if (!user) {
        const allUsers = await prisma.user.findMany()
        console.log({ allUsers })
        DEBUG && console.log('No user found with given email')
        return res.status(400).send({
          message: 'Please check your sign-in details',
        })
      }
      const result = await bcrypt.compare(password, user.password)
      if (!result) {
        DEBUG && console.log('Incorrect password given')
        return res.status(400).send({
          message: 'Please check your sign-in details',
        })
      }
      const token = generateToken(user)
      return res.status(200).send({
        token,
      })
    } catch (e) {
      console.log(e)
      res.status(500).send('There was a problem signing you in')
    }
  }
)

export default router
