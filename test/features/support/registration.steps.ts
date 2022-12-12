import request from 'supertest'
import { PrismaClient } from '@prisma/client'

const USER_EMAIL = 'test@test.test'
const USER_PASSWORD = '123sail?999'

import app from '../../../src/app'
import { StepDefinitions, loadFeatures, autoBindSteps } from 'jest-cucumber'
// import {
//   iReceiveAStatusCodeOf,
//   iReceiveAnErrorMessageContaining,
// } from './api.steps.shared'
import { aUserExistsWithEmail } from './users.steps.shared'

export const registrationSteps: StepDefinitions = ({
  given,
  when,
  then,
  and,
}) => {
  const prisma = new PrismaClient()
  let response: request.Response

  const cleanup = async () => {
    const deleteUsers = prisma.user.deleteMany()

    await prisma.$transaction([deleteUsers])
    await prisma.$disconnect()
  }

  beforeEach(async () => await cleanup())
  afterAll(async () => await cleanup())

  // aUserExistsWithEmail(given)

  then(/^I receive a status code of (\d+)$/, (arg0) => {
    console.log(arg0)
  })

  then(/I receive an error message containing '(.*)'/, (message: string) => {
    expect(response.body.message).toMatch(message)
  })

  when(
    /I send a request to register with email '([\w-@.]+)'/,
    async (email: string) => {
      response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: email.toString(), password: USER_PASSWORD })
    }
  )

  when(
    'I send a request to register with an email and no password',
    async () => {
      response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: USER_EMAIL })
    }
  )

  when(
    'I send a request to register with a password and no email',
    async () => {
      response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ password: USER_PASSWORD })
    }
  )

  then(/^I receive a status code of (\d+)$/, (arg0) => {
    console.log(arg0)
  })

  // iReceiveAStatusCodeOf(then, () => response)

  // iReceiveAnErrorMessageContaining(then, () => response)

  and(
    /a user has been created with email '([\w-_@.]+)'/,
    async (email: string) => {
      const users = await prisma.user.findMany()
      expect(users.length).toBe(1)
      expect(users[0].email).toBe(email.toString())
    }
  )
}

// const features = loadFeatures('../registration.feature')
// autoBindSteps(features, [registrationSteps])
