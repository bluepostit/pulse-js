import { cleanEnv, str, url, makeValidator, bool, num } from 'envalid'

const nonEmptyString = makeValidator((value) => {
  if (value.trim().length > 0) {
    return value
  }
  throw new Error('Expected non-empty string')
})

const env = cleanEnv(process.env, {
  DATABASE_URL: url(),
  DEBUG: bool({ default: false }),
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  PORT: num({ default: 3000 }),
  SALT_ROUNDS: num({ default: 10 }),
  TOKEN_SECRET: nonEmptyString(),
})

export default env
