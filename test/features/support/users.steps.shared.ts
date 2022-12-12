import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const USER_PASSWORD = '123sail?999'
const { SALT_ROUNDS } = process.env

const prisma = new PrismaClient()

import { DefineStepFunction } from 'jest-cucumber'

prisma.$use(async (params, next) => {
  if (params.model === 'User' && ['create', 'update'].includes(params.action)) {
    console.log(params.args.data)
    const password = params.args.data.password
    if (password) {
      const rounds = parseInt(SALT_ROUNDS || '10', 10)
      const hashedPassword = await hash(password, rounds)
      params.args.data.password = hashedPassword
    }
    console.log('hooked data in test file', { data: params.args.data })
    return await next(params)
  }
})

export const aUserExistsWithEmailAndPassword = (given: DefineStepFunction) => {
  given(
    /^a user exists with email '([\w-_@.]+)' and password '(.*)'$/,
    async (email: string, password: string) => {
      console.log('a user exists with email and password')
      const user = await prisma.user.create({
        data: {
          email,
          password,
        },
      })
      console.log('user created (e + p):', { user })
    }
  )
}

export const aUserExistsWithEmail = (given: DefineStepFunction) => {
  given(/^a user exists with email '([\w-_@.]+)'$/, async (email: string) => {
    console.log('a user exists with email')
    const user = await prisma.user.create({
      data: {
        email,
        password: USER_PASSWORD,
      },
    })
    console.log('user created (email):', { user })
  })
}
