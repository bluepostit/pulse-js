import { loadFeatures, autoBindSteps } from 'jest-cucumber'

import { registrationSteps } from './registration.steps'
import { signInSteps } from './sign-in.steps'

const features = loadFeatures('test/features/**/*.feature')
console.log(features)
autoBindSteps(features, [registrationSteps, signInSteps])
