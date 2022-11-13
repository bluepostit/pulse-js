const request = require('supertest')

const app = require('../src/app')

describe('Registration', () => {
  it('should throw an error when no email is given', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ password: '123456' })
    expect(response.statusCode).toBe(400)
  })

  it('should throw an error when no password is given', () => {
    return request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.test' })
      .expect(400)
  })

  it('should return OK when email and password are given', () => {
    return request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.test', password: '123456' })
      .expect(200)
  })
})
