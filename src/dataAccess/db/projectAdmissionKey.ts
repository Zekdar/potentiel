import { DataTypes } from 'sequelize'
import { ProjectAdmissionKeyRepo } from '../'
import { ProjectAdmissionKey, makeProjectAdmissionKey } from '../../entities'
import { mapExceptError, mapIfOk } from '../../helpers/results'
import { Err, None, Ok, OptionAsync, ResultAsync, Some } from '../../types'
import CONFIG from '../config'
import isDbReady from './helpers/isDbReady'

// Override these to apply serialization/deserialization on inputs/outputs
const deserialize = item => item
const serialize = item => item

export default function makeProjectAdmissionKeyRepo({
  sequelize
}): ProjectAdmissionKeyRepo {
  const ProjectAdmissionKeyModel = sequelize.define('projectAdmissionKey', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  })

  const _isDbReady = isDbReady({ sequelize })

  return Object.freeze({
    findById,
    findAll,
    insert
  })

  async function findById(
    id: ProjectAdmissionKey['id']
  ): OptionAsync<ProjectAdmissionKey> {
    await _isDbReady

    try {
      const projectAdmissionKeyInDb = await ProjectAdmissionKeyModel.findByPk(
        id,
        { raw: true }
      )

      if (!projectAdmissionKeyInDb) return None

      const projectAdmissionKeyInstance = makeProjectAdmissionKey(
        deserialize(projectAdmissionKeyInDb)
      )

      if (projectAdmissionKeyInstance.is_err())
        throw projectAdmissionKeyInstance.unwrap_err()

      return Some(projectAdmissionKeyInstance.unwrap())
    } catch (error) {
      if (CONFIG.logDbErrors)
        console.log('ProjectAdmissionKey.findById error', error)
      return None
    }
  }

  async function findAll(
    query?: Record<string, any>
  ): Promise<Array<ProjectAdmissionKey>> {
    await _isDbReady

    try {
      const projectAdmissionKeysRaw = await ProjectAdmissionKeyModel.findAll(
        query
          ? {
              where: query
            }
          : {},
        { raw: true }
      )

      const deserializedItems = mapExceptError(
        projectAdmissionKeysRaw,
        deserialize,
        'ProjectAdmissionKey.findAll.deserialize error'
      )

      return mapIfOk(
        deserializedItems,
        makeProjectAdmissionKey,
        'ProjectAdmissionKey.findAll.makeProjectAdmissionKey error'
      )
    } catch (error) {
      if (CONFIG.logDbErrors)
        console.log('ProjectAdmissionKey.findAll error', error)
      return []
    }
  }

  async function insert(
    projectAdmissionKey: ProjectAdmissionKey
  ): ResultAsync<ProjectAdmissionKey> {
    await _isDbReady

    try {
      await ProjectAdmissionKeyModel.create(serialize(projectAdmissionKey))
      return Ok(projectAdmissionKey)
    } catch (error) {
      if (CONFIG.logDbErrors)
        console.log('ProjectAdmissionKey.insert error', error)
      return Err(error)
    }
  }
}

export { makeProjectAdmissionKeyRepo }
