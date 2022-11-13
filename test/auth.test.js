const request = require('supertest')

const app = require('../src/app')

describe('Registration', () => {
  it('should throw an error when no email is given', () => {
    return request(app)
      .post('/api/auth/register')
      .send({})
      .expect(400)
  })
})
