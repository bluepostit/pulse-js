import path from 'path'
import request from 'supertest'
import { PrismaClient } from '@prisma/client'

const USER_EMAIL = 'test@test.test'
const USER_PASSWORD = '123sail?999'

import app from '../../../src/app'
import { StepDefinitions, loadFeatures, autoBindSteps } from 'jest-cucumber'
import {
  iReceiveAStatusCodeOf,
  iReceiveAnErrorMessageContaining,
} from './api.steps.shared'
import {
  aUserExistsWithEmail,
  aUserExistsWithEmailAndPassword,
} from './users.steps.shared'

export const signInSteps: StepDefinitions = ({ given, when, then, and }) => {
  const prisma = new PrismaClient()
  let response: request.Response

  const cleanup = async () => {
    const deleteUsers = prisma.user.deleteMany()

    await prisma.$transaction([deleteUsers])
    await prisma.$disconnect()
  }

  beforeEach(async () => await cleanup())
  afterAll(async () => await cleanup())

  aUserExistsWithEmail(given)

  aUserExistsWithEmailAndPassword(given)

  iReceiveAStatusCodeOf(then, () => response)

  iReceiveAnErrorMessageContaining(then, () => response)

  when(
    /^I send a request to sign in with email '([\w-_@.]+)' and password '(.*)'$/,
    async (email: string, password: string) => {
      console.log('requesting login with email + password')
      response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password })
    }
  )

  when(
    /^I send a request to sign in with email '([\w-_@.]+)'$/,
    async (email: string) => {
      console.log('requesting login with email only')
      response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: USER_PASSWORD })
    }
  )

  when('I send a request to sign in with a password and no email', async () => {
    response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ password: USER_PASSWORD })
  })

  when(
    'I send a request to sign in with an email and no password',
    async () => {
      response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: USER_EMAIL })
    }
  )
}

// const features = loadFeatures(path.join(__dirname, '../registration.feature'))
// console.log({ features })
// autoBindSteps(features, [signInSteps])

// test('asdf', () => { console.log('asdf')})
