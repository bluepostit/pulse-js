import express, { Request, RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'
import { validateAuthToken } from '../../middleware/authentication'

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

router.post('/', validateAuthToken, async (req, res) => {
  const pulse = await prisma.pulse.create({
    data: {
      userId: req.userId as number,
    },
  })
  res.status(201).json({
    message: 'Pulse created',
    pulse,
  })
})

export default router
