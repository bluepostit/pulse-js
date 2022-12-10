import { Request, RequestHandler } from 'express'
import jwt, { Secret } from 'jsonwebtoken'
import env from '../env'
const TOKEN_SECRET: Secret = env.TOKEN_SECRET

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
    console.log(user)
    next()
  })
}

export { validateAuthToken }
