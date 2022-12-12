import request from 'supertest'
import { PrismaClient } from '@prisma/client'

const USER_EMAIL = 'test@test.test'
const USER_PASSWORD = '123sail?999'
const USER_PASSWORD_HASH =
  '$2b$10$Cep7g3y73V7gHyQQgRMPBezhaiez5BJrEqzhbtiTbuaWm9vn9RYNO'

import app from '../../src/app'
const prisma = new PrismaClient()

const cleanup = async () => {
  const deleteUsers = prisma.user.deleteMany()

  await prisma.$transaction([deleteUsers])
  await prisma.$disconnect()
}

describe('Sign in', () => {
  beforeEach(async () => {
    await cleanup()
    await prisma.user.create({
      data: {
        email: USER_EMAIL,
        password: USER_PASSWORD,
      },
    })
  })

  afterAll(async () => await cleanup())

  it('should return OK when credentials are correct', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: USER_EMAIL, password: USER_PASSWORD })
    expect(response.statusCode).toBe(200)
  })

  it('should return a token when credentials are correct', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: USER_EMAIL, password: USER_PASSWORD })
    expect(response.statusCode).toBe(200)
    expect(response.body.token).toBeTruthy()
    expect(response.body.token.length).toBeGreaterThanOrEqual(20)
  })
})
