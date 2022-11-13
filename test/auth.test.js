const request = require('supertest')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const app = require('../src/app')

describe('Registration', () => {

  const cleanup = async () => {
    const deleteUsers = prisma.user.deleteMany()

    await prisma.$transaction([
      deleteUsers
    ])

    await prisma.$disconnect()
  }

  beforeEach(cleanup)
  afterAll(cleanup)

  it('should throw an error when no email is given', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ password: '123456' })
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toMatch(/email/)
  })

  it('should throw an error when no password is given', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: 'test@test.test' })
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toMatch(/password/)
  })

  it('should return OK when email and password are given', () => {
    return request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.test', password: '123456' })
      .expect(200)
  })

  it('should create a user when email and password are given', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: 'test@test.test', password: '123456' })
    expect(response.statusCode).toBe(200)

    // now query db to see if a record was created
    const users = await prisma.user.findMany()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe('test@test.test')
  })
})
