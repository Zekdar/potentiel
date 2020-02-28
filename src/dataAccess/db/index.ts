import { Sequelize } from 'sequelize'
import * as path from 'path'

import { makeCredentialsRepo } from './credentials'
import { makeUserRepo } from './user'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '../../../.db/db.sqlite')
})

// Create repo implementations
const credentialsRepo = makeCredentialsRepo({
  sequelize
})

const userRepo = makeUserRepo({ sequelize })

// Sync the database models
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
    return sequelize.sync({ force: false }) // Set to true to crush db if changes
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })
  .then(() => {
    console.log('Database models are sync')
  })
  .catch(err => {
    console.error('Unable to sync database models')
  })

const dbAccess = Object.freeze({
  userRepo,
  credentialsRepo
})

export default dbAccess
export { userRepo, credentialsRepo }
