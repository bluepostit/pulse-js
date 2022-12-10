import express, { Request, RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt, { Secret } from 'jsonwebtoken'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/:userId', async (req, res) => {
  const userId = req.params.userId

  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(userId, 10),
    },
    include: {
      pulses: true,
    },
  })
  res.json({
    pulses: user?.pulses || [],
  })
})

export default router
