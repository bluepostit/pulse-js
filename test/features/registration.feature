Feature: Registration

  Allows a user to register for the service

  Scenario: Registering for the service with missing password
    When I send a request to register with an email and no password
    Then I receive a status code of 400
#   And I receive an error message containing 'password'

# Scenario: Registering for the service with missing email
#   When I send a request to register with a password and no email
#   Then I receive a status code of 400
#   And I receive an error message containing 'email'

# Scenario: Registering with the email address of an existing user
#   Given a user exists with email 'test@test.com'
#   When I send a request to register with email 'test@test.com'
#   Then I receive a status code of 400
#   And I receive an error message containing 'email'

# Scenario: Registering successfully
#   When I send a request to register with email 'test@test.com'
#   Then I receive a status code of 200
#   And a user has been created with email 'test@test.com'
