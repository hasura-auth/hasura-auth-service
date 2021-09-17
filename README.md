# hasura-auth

inspired by hasura backend plus and keycloak with few fundemental key differences

- auth service handels only authentication/authroization related tasks
- rate-limiting, bot-detection etc to be handeled on a higher level through an API gateway, kong in this case.

## Pre-requisitions

- docker
- yarn
  <br /><br />

## Teck Stack

<br /><br />

## Usage

1. following line needs to be added to your hosts file in order for kong to find your host from the docker container.

   `<host IP> kong-upstream`

   or by following command in termianl

   `sudo sh -c 'echo "<host IP> kong-upstream" >> /etc/hosts'`

2. to start docker containers run

   `docker-compose up -d`

3. start auth service by

   `yarn dev`

# Notes

when you change rsa key, remember to restart hasura service so that it calls jwks endpoints again
