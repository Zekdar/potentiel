import { DataTypes } from 'sequelize'
import { UserRepo } from '../'
import { User, makeUser, Project, makeProject, DREAL } from '../../entities'
import { mapExceptError, mapIfOk } from '../../helpers/results'
import {
  Err,
  None,
  Ok,
  OptionAsync,
  ResultAsync,
  Some,
  ErrorResult,
} from '../../types'
import CONFIG from '../config'
import isDbReady from './helpers/isDbReady'
import { retrievePassword } from '../../useCases'

// Override these to apply serialization/deserialization on inputs/outputs
const deserialize = (item) => ({
  ...item,
  projectAdmissionKey: item.projectAdmissionKey || undefined,
  fullName: item.fullName || '',
})
const serialize = (item) => item

export default function makeUserRepo({ sequelize }): UserRepo {
  const UserModel = sequelize.define('user', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    projectAdmissionKey: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  })

  const UserDrealModel = sequelize.define('userDreal', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    dreal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  })

  const _isDbReady = isDbReady({ sequelize })

  return Object.freeze({
    findById,
    findAll,
    findUsersForDreal,
    findDrealsForUser,
    addToDreal,
    insert,
    update,
    addProject,
    remove,
    hasProject,
    addUserToProjectsWithEmail,
    addProjectToUserWithEmail,
  })

  // findDrealsForUser: (userId: User['id']) => Promise<Array<DREAL>>
  // addToDreal: (userId: User['id'], dreal: DREAL) => ResultAsync<null>

  async function findUsersForDreal(dreal: string): Promise<Array<User>> {
    await _isDbReady

    try {
      if (!dreal) return []

      const drealUsersIds = (
        await UserDrealModel.findAll({
          where: { dreal },
        })
      ).map((item) => item.get().userId)

      if (!drealUsersIds.length) return []

      const drealUsersRaw = await UserModel.findAll({
        where: { id: drealUsersIds },
      })

      // console.log(
      //   'findUsersForDreal (db) found',
      //   drealUsersRaw,
      //   drealUsersRaw.map((item) => item.get())
      // )

      const deserializedItems = mapExceptError(
        drealUsersRaw.map((item) => item.get()),
        deserialize,
        'User.findUsersForDreal.deserialize error'
      )

      return mapIfOk(
        deserializedItems,
        makeUser,
        'User.findUsersForDreal.makeUser error'
      )
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('User.findUsersForDreal error', error)
      return []
    }
  }

  async function findDrealsForUser(userId: User['id']): Promise<Array<DREAL>> {
    await _isDbReady

    try {
      const userDreals = await UserDrealModel.findAll({ where: { userId } })

      return userDreals.map((item) => item.get().dreal)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('User.findDrealsForUser error', error)
      return []
    }
  }

  async function addToDreal(
    userId: User['id'],
    dreal: DREAL
  ): ResultAsync<null> {
    await _isDbReady

    try {
      await UserDrealModel.create({ userId, dreal })

      return Ok(null)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('User.findDrealsForUser error', error)
      return Err(error)
    }
  }

  async function findById(id: User['id']): OptionAsync<User> {
    await _isDbReady

    try {
      const userInDb = await UserModel.findByPk(id, { raw: true })

      if (!userInDb) return None

      const userInstance = makeUser(deserialize(userInDb))

      if (userInstance.is_err()) throw userInstance.unwrap_err()

      return Some(userInstance.unwrap())
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('User.findById error', error)
      return None
    }
  }

  async function findAll(query?: Record<string, any>): Promise<Array<User>> {
    await _isDbReady

    try {
      const usersRaw = await UserModel.findAll(
        query
          ? {
              where: query,
            }
          : {}
      )

      const deserializedItems = mapExceptError(
        usersRaw.map((user) => user.get()),
        deserialize,
        'User.findAll.deserialize error'
      )

      return mapIfOk(deserializedItems, makeUser, 'User.findAll.makeUser error')
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('User.findAll error', error)
      return []
    }
  }

  async function insert(user: User): ResultAsync<User> {
    await _isDbReady

    try {
      await UserModel.create(serialize(user))
      return Ok(user)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('User.insert error', error)
      return Err(error)
    }
  }

  async function update(user: User): ResultAsync<User> {
    await _isDbReady

    try {
      await UserModel.update(serialize(user), {
        where: { id: user.id },
      })
      return Ok(user)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('User.findAll error', error)
      return Err(error)
    }
  }

  async function addProject(
    userId: User['id'],
    projectId: Project['id']
  ): ResultAsync<null> {
    try {
      // Check if user already has access to this project
      const priorAccess = await hasProject(userId, projectId)
      if (priorAccess) return Ok(null)

      const userInstance = await UserModel.findByPk(userId)

      if (!userInstance) {
        throw new Error('Cannot find user to add project to')
      }

      const ProjectModel = sequelize.model('project')
      const projectInstance = await ProjectModel.findByPk(projectId)

      if (!projectInstance) {
        throw new Error('Cannot find project to be added to user')
      }

      await userInstance.addProject(projectInstance)
      return Ok(null)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('User.addProject error', error)
      return Err(error)
    }
  }

  async function addUserToProjectsWithEmail(
    userId: User['id'],
    email: Project['email']
  ): ResultAsync<null> {
    try {
      const userInstance = await UserModel.findByPk(userId)

      if (!userInstance) {
        throw new Error('Cannot find user to add project to')
      }

      const ProjectModel = sequelize.model('project')
      const projectsWithEmail = await ProjectModel.findAll({ where: { email } })

      await userInstance.addProjects(projectsWithEmail)

      return Ok(null)
    } catch (error) {
      if (CONFIG.logDbErrors)
        console.log('User.addUserToProjectsWithEmail error', error)
      return Err(error)
    }
  }

  async function addProjectToUserWithEmail(
    projectId: Project['id'],
    email: Project['email']
  ): ResultAsync<null> {
    try {
      const userInstance = await UserModel.findOne({ where: { email } })

      if (!userInstance) {
        // No user with that email, just ignore the command
        return Ok(null)
      }

      const ProjectModel = sequelize.model('project')
      const projectInstance = await ProjectModel.findByPk(projectId)

      if (!projectInstance) {
        throw new Error('Cannot find project to be added to user')
      }

      await userInstance.addProject(projectInstance)
      return Ok(null)
    } catch (error) {
      if (CONFIG.logDbErrors)
        console.log('User.addProjectToUserWithEmail error', error)
      return Err(error)
    }
  }

  async function hasProject(
    userId: User['id'],
    projectId: Project['id']
  ): Promise<boolean> {
    try {
      const userInstance = await UserModel.findByPk(userId)

      if (!userInstance) {
        throw new Error('Cannot find user')
      }

      const ProjectModel = sequelize.model('project')
      const projectInstance = await ProjectModel.findByPk(projectId)

      if (!projectInstance) {
        throw new Error('Cannot find project')
      }

      return await userInstance.hasProject(projectInstance)
    } catch (error) {
      const ProjectModel = sequelize.model('project')
      const allProjects = await ProjectModel.findAll()
      console.log('hasProject found all projects', allProjects)

      if (CONFIG.logDbErrors)
        console.log('User.hasProject error', error, userId, projectId)
      return false
    }
  }

  async function remove(id: User['id']): ResultAsync<null> {
    await _isDbReady

    try {
      await UserModel.destroy({ where: { id } })
      return Ok(null)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('User.remove error', error)
      return Err(error)
    }
  }
}

export { makeUserRepo }
