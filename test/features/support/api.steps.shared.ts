import { DefineStepFunction } from 'jest-cucumber'
import { ResponseFunction } from './types'

export const iReceiveAStatusCodeOf = (
  then: DefineStepFunction,
  responseFunction: ResponseFunction
) => {
  console.log('i receive a status code of!')
  then(/I receive a status code of (\d+)/, (code) => {
    expect(responseFunction().body.message).toBe(code)
  })
}

export const iReceiveAnErrorMessageContaining = (
  then: DefineStepFunction,
  responseFunction: ResponseFunction
) => {
  then(/I receive an error message containing '(.*)'/, (message: string) => {
    expect(responseFunction().body.message).toMatch(message)
  })
}
