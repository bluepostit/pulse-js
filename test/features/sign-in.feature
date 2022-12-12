Feature: Sign In

  Allows the user to sign in to the service

  Scenario: Signing in with missing email
    When I send a request to sign in with a password and no email
    Then I receive a status code of 400
    And I receive an error message containing 'email'

  Scenario: Signing in with missing password
    When I send a request to sign in with an email and no password
    Then I receive a status code of 400
    And I receive an error message containing 'password'

  Scenario: Signing in with non-existent email
    Given a user exists with email 'test@test.com'
    When I send a request to sign in with email 'missing@test.com'
    Then I receive a status code of 400
    And I receive an error message containing 'check'

  Scenario: Signing in with incorrect password
    Given a user exists with email 'test@test.com' and password '123456'
    When I send a request to sign in with email 'test@test.com' and password '99999'
    Then I receive a status code of 400
    And I receive an error message containing 'check'

  Scenario: Signing in with correct credentials
    Given a user exists with email 'test@test.com' and password '123456'
    When I send a request to sign in with email 'test@test.com' and password '123456'
    Then I receive a status code of 200
# And I receive an authentication token
