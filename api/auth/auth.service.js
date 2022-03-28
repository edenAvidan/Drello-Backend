const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')

module.exports = {
  signup,
  login,
}

async function login(username, password) {
  logger.debug(`auth.service - login with username: ${username}`)

  const user = await userService.getByUsername(username)

  if (!user) return Promise.reject('Invalid username or password')
  // TODO: un-comment for real login
  console.log(user)
  if (!user.type) {
    const match = await bcrypt.compare(password, user.password)
    if (!match) return Promise.reject('Invalid username or password')
  }
  delete user.password
  return user
}

async function signup(username, password, fullname, imgUrl, type) {
  const saltRounds = 10

  logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
  const user = await userService.getByUsername(username);
  if (user) return Promise.reject('username already exists');

  if (!username || !fullname || (type !== 'google' && !password))
    return Promise.reject('fullname, username and password are required!')

  if (!type) {
    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ username, password: hash, fullname })
  } else {
    console.log(type, '123')
    return userService.add({ username, fullname, imgUrl, type })
  }
}
