require('dotenv').config()
require('pg').defaults.parseInt8 = true
const chalk = require('chalk')
const Sequelize = require('sequelize')

const {
  POSTGRESQL_ADDON_HOST,
  POSTGRESQL_ADDON_PORT,
  POSTGRESQL_ADDON_DB,
  POSTGRESQL_ADDON_USER,
  POSTGRESQL_ADDON_PASSWORD,
  POSTGRESQL_POOL_MAX,
  NODE_ENV,
} = process.env

let databaseOptions = {
  dialect: 'postgres',
  host: POSTGRESQL_ADDON_HOST,
  username: POSTGRESQL_ADDON_USER,
  password: POSTGRESQL_ADDON_PASSWORD,
  database: POSTGRESQL_ADDON_DB,
  port: POSTGRESQL_ADDON_PORT,
  logging: false,
  pool: {
    max: Number(POSTGRESQL_POOL_MAX),
  },
}

if (NODE_ENV === 'test') {
  databaseOptions = {
    dialect: 'postgres',
    host: 'localhost',
    username: 'testuser',
    database: 'potentiel_test',
    port: 5433,
    logging: false,
  }
}

const sequelizeInstance = new Sequelize(databaseOptions)

sequelizeInstance.authenticate().catch((error) => {
  console.error(chalk.red`❌ There was an error while trying to connect to the database > ${error}`)
  throw error
})

module.exports = databaseOptions
module.exports.sequelizeInstance = sequelizeInstance
