import express, { Request, RequestHandler } from 'express'
import { PrismaClient, PulseStatus } from '@prisma/client'
import { validateAuthToken } from '../../middleware/authentication'

const router = express.Router()
const prisma = new PrismaClient()

type PulseBody = {
  status?: PulseStatus
  reachable?: boolean
}

type PulseData = {
  userId: number
  status?: PulseStatus
  reachable?: boolean
}

const validatePulseBody: RequestHandler = (req, res, next) => {
  const body: PulseBody = req.body
  const status = body.status
  if (status) {
    const statuses: string[] = Object.values(PulseStatus)
    if (!statuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
      })
    }
  }

  next()
}

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

router.post('/', validateAuthToken, validatePulseBody, async (req, res) => {
  const data: PulseData = {
    userId: req.userId as number,
  }

  if (req.body.status) {
    data.status = req.body.status
  }
  if ([true, false].includes(req.body.reachable)) {
    data.reachable = req.body.reachable
  }

  const pulse = await prisma.pulse.create({ data })
  res.status(201).json({
    message: 'Pulse created',
    pulse,
  })
})

export default router
