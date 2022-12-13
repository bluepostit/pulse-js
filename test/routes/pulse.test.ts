import request from 'supertest'
import { Prisma, PrismaClient, User } from '@prisma/client'

import app from '../../src/app'

const USER_EMAIL = 'test@test.test'
const USER_PASSWORD = '123sail?999'
const USER2_EMAIL = 'test2@test.test'
const USER2_PASSWORD = USER_PASSWORD

const prisma = new PrismaClient()

import {
  mockJwtTokenValidationTokenError,
  mockJwtTokenValidationTokenSuccess,
} from './util'

const cleanup = async () => {
  const deletePulses = prisma.pulse.deleteMany()
  const deleteUsers = prisma.user.deleteMany()

  await prisma.$transaction([deletePulses, deleteUsers])
  await prisma.$disconnect()
}

describe('Pulse', () => {
  const createUser = async () => {
    return await prisma.user.create({
      data: {
        email: USER_EMAIL,
        password: USER_PASSWORD,
      },
    })
  }

  const createUserWithTwoPulses = async () => {
    return await prisma.user.create({
      data: {
        email: USER_EMAIL,
        password: USER_PASSWORD,
        pulses: {
          create: [{}, {}],
        },
      },
    })
  }

  const createTwoUsersWithTwoPulsesEach = async () => {
    const users: Prisma.UserCreateInput[] = [
      {
        email: USER_EMAIL,
        password: USER_PASSWORD,
        pulses: {
          create: [{}, {}],
        },
      },
      {
        email: USER2_EMAIL,
        password: USER2_PASSWORD,
        pulses: {
          create: [{}, {}],
        },
      },
    ]

    const createdUsers: User[] = await Promise.all(
      users.map(async (user) => {
        return await prisma.user.create({
          data: user,
        })
      })
    )
    return createdUsers
  }

  describe('get pulses for user', () => {
    beforeEach(async () => {
      await cleanup()
    })

    afterAll(async () => {
      await cleanup()
    })

    it('should return an empty array when no pulses exist', async () => {
      const user = await createUser()
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
      const users = await createTwoUsersWithTwoPulsesEach()

      const url = `/api/pulses/${users[0].id}`
      const response = await request(app)
        .get(url)
        .set('Content-Type', 'application/json')
        .send()
      expect(response.statusCode).toBe(200)
      expect(response.body.pulses).toBeInstanceOf(Array)
      expect(response.body.pulses.length).toBe(2)
    })
  })

  describe('Create a new pulse', () => {
    beforeEach(async () => {
      await cleanup()
    })

    afterAll(async () => {
      await cleanup()
    })

    it('should return an error if no authentication token is given', async () => {
      const url = `/api/pulses`
      const response = await request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .send({})
      expect(response.statusCode).toBe(401) // unauthorized
      expect(response.body.message).toMatch('token')
    })

    it('should return an error if an incorrect authentication token is given', async () => {
      mockJwtTokenValidationTokenError()

      const url = `/api/pulses`
      const response = await request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'fake token')
        .send({})
      expect(response.statusCode).toBe(403) // forbidden
      expect(response.body.message).toMatch(/token/i)
    })

    it('should return a success when a pulse is created', async () => {
      const user = await createUser()
      mockJwtTokenValidationTokenSuccess(user)

      const url = `/api/pulses`
      const response = await request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'fake token')
        .send({})
      expect(response.statusCode).toBe(201) // created
      expect(response.body.message).toMatch(/pulse/i)
      expect(response.body.pulse).toHaveProperty('id')
    })

    it('should create a pulse with the given data', async () => {
      const user = await createUser()
      mockJwtTokenValidationTokenSuccess(user)

      const url = `/api/pulses`
      const response = await request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'fake token')
        .send({
          status: 'IN_DANGER',
          reachable: false,
        })
      expect(response.statusCode).toBe(201) // created
      expect(response.body.message).toMatch(/pulse/i)
      expect(response.body).toHaveProperty('pulse')
      const pulse = response.body.pulse
      expect(pulse).toHaveProperty('id')
      expect(pulse.status).toBe('IN_DANGER')
      expect(pulse.reachable).toBe(false)
    })

    it('should return an error when an invalid status is given', async () => {
      const user = await createUser()
      mockJwtTokenValidationTokenSuccess(user)

      const url = `/api/pulses`
      const response = await request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'fake token')
        .send({
          status: 'DEFINITELY_NOT_REAL',
          reachable: false,
        })
      expect(response.statusCode).toBe(400)
      expect(response.body.message).toMatch(/status/i)

      const pulseCount = await prisma.pulse.count()
      expect(pulseCount).toBe(0)
    })
  })
})
