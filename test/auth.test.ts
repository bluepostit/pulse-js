import request from 'supertest'
import { PrismaClient } from '@prisma/client'

const USER_EMAIL = 'test@test.test'
const USER_PASSWORD = '123sail?999'
const USER_PASSWORD_HASH = '$2b$10$Cep7g3y73V7gHyQQgRMPBezhaiez5BJrEqzhbtiTbuaWm9vn9RYNO'

import app from '../src/app'
const prisma = new PrismaClient()

const cleanup = async () => {
  const deleteUsers = prisma.user.deleteMany()

  await prisma.$transaction([
    deleteUsers
  ])

  await prisma.$disconnect()
}

describe('Registration', () => {
  beforeEach(cleanup)
  afterAll(cleanup)

  it('should return an error when no email is given', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ password: '123456' })
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toMatch(/email/)
  })

  it('should return an error when no password is given', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: 'test@test.test' })
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toMatch(/password/)
  })

  it('should return an error when an existing user has the given email', async () => {
    await prisma.user.create({
      data: {
        email: USER_EMAIL,
        password: USER_PASSWORD
      }
    })

    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: USER_EMAIL, password: USER_PASSWORD })
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toMatch(/email/i)
  })

  it('should return OK when email and password are given', () => {
    return request(app)
      .post('/api/auth/register')
      .send({ email: USER_EMAIL, password: USER_PASSWORD })
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

describe('Sign in', () => {
  beforeEach(async () => {
    await cleanup()
    const password = USER_PASSWORD_HASH
    await prisma.user.create({
      data: {
        email: USER_EMAIL,
        password
      }
    })
  })

  afterAll(cleanup)

  it('should return an error when no email is given', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ password: USER_PASSWORD })
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toMatch(/email/)
  })

  it('should return an error when no password is given', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: USER_EMAIL })
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toMatch(/password/)
  })

  it('should return an error when email isn\'t found', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: `abc+${USER_EMAIL}`, password: USER_PASSWORD })
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toMatch(/check/i)
  })

  it('should return an error when password is wrong', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: USER_EMAIL, password: `abc+${USER_PASSWORD}` })
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toMatch(/check/i)
  })

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
