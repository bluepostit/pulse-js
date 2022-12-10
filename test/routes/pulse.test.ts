import request from 'supertest'
import { Prisma, PrismaClient, User } from '@prisma/client'

import app from '../../src/app'

const USER_EMAIL = 'test@test.test'
const USER_PASSWORD = '123sail?999'

const prisma = new PrismaClient()

const cleanup = async () => {
  const deletePulses = prisma.pulse.deleteMany()
  const deleteUsers = prisma.user.deleteMany()

  await prisma.$transaction([deletePulses, deleteUsers])
  await prisma.$disconnect()
}

describe('Pulse', () => {
  describe('get pulses for user', () => {
    let user: User

    beforeEach(async () => {
      await cleanup()
    })

    afterAll(async () => {
      await cleanup()
    })

    const createUser = async () => {
      user = await prisma.user.create({
        data: {
          email: USER_EMAIL,
          password: USER_PASSWORD,
        },
      })
    }

    it('should return an empty array when no pulses exist', async () => {
      await createUser()
      const url = `/api/pulses/${user.id}`
      const response = await request(app)
        .get(url)
        .set('Content-Type', 'application/json')
        .send()
      expect(response.statusCode).toBe(200)
      expect(response.body.pulses).toBeInstanceOf(Array)
      expect(response.body.pulses.length).toBe(0)
    })

    it("should return the user's pulses", async () => {
      await prisma.user.create({
        data: {
          email: USER_EMAIL,
          password: USER_PASSWORD,
          pulses: {
            create: [{}, {}],
          },
        },
      })
    })
  })
})
