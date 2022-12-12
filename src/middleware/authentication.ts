import { Request, RequestHandler } from 'express'
import jwt, { Secret, JwtPayload } from 'jsonwebtoken'
import { User } from '@prisma/client'
import env from '../env'
const TOKEN_SECRET: Secret = env.TOKEN_SECRET

const generateToken = (user: User) => {
  const payload = {
    id: user.id,
  }
  return jwt.sign(payload, TOKEN_SECRET, {
    expiresIn: '14d',
  })
}

const validateAuthToken: RequestHandler = (req, res, next) => {
  const tokenHeader = req.header('authorization')
  const token = tokenHeader?.split(' ')[1]
  if (!token) {
    return res.status(401).json({
      message: 'Authorization token not given',
    })
  }

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: 'Token not verified',
      })
    }
    const userObject = user as JwtPayload
    req.userId = userObject.id
    next()
  })
}

export { generateToken, validateAuthToken }
