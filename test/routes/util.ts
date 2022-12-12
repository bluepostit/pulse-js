import { User } from '@prisma/client'
import jwt, {
  GetPublicKeyOrSecret,
  Secret,
  VerifyCallback,
  Jwt,
  JwtPayload,
  VerifyOptions,
  VerifyErrors,
  JsonWebTokenError,
} from 'jsonwebtoken'

type JwtTokenVerifyImplementation = (
  token: string,
  secret: Secret | GetPublicKeyOrSecret,
  optionsOrCallback?:
    | VerifyOptions
    | undefined
    | ((
        arg0: VerifyErrors | undefined,
        arg1: TokenPayload | undefined
      ) => unknown),
  callback?: VerifyCallback<string | Jwt | JwtPayload> | undefined
) => void

// type JwtTokenVerifyCallbackImplementation =
//   | VerifyCallback<string | Jwt | JwtPayload>
//   | undefined

type TokenPayload = {
  id: number
}

const mockJwtTokenValidationTokenError = () => {
  const mock = jest.spyOn(jwt, 'verify')
  const implementation: JwtTokenVerifyImplementation = (
    token,
    secret,
    optionsActuallyCallback?
    // callback?: JwtTokenVerifyCallbackImplementation
  ) => {
    if (optionsActuallyCallback instanceof Function) {
      const error = new JsonWebTokenError('invalid token')
      console.log('about to call the callback with an error!')
      optionsActuallyCallback(error, undefined)
    }
  }
  mock.mockImplementation(implementation)
}
const mockJwtTokenValidationTokenSuccess = (user: User) => {
  const mock = jest.spyOn(jwt, 'verify')
  const implementation: JwtTokenVerifyImplementation = (
    token,
    secret,
    optionsActuallyCallback?
    // callback?: JwtTokenVerifyCallbackImplementation
  ) => {
    if (optionsActuallyCallback instanceof Function) {
      console.log('about to call the callback with the user data!')
      optionsActuallyCallback(undefined, { id: user.id })
    }
  }
  mock.mockImplementation(implementation)
}

export { mockJwtTokenValidationTokenError, mockJwtTokenValidationTokenSuccess }
