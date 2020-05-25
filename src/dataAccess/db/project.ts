import { DataTypes, Op, Transaction } from 'sequelize'
import { ProjectRepo } from '../'
import {
  Project,
  User,
  makeProject,
  CandidateNotification,
} from '../../entities'
import { mapExceptError, mapIfOk } from '../../helpers/results'
import { paginate, pageCount, makePaginatedList } from '../../helpers/paginate'
import {
  Err,
  None,
  Ok,
  OptionAsync,
  ResultAsync,
  Some,
  Pagination,
  PaginatedList,
} from '../../types'
import CONFIG from '../config'
import isDbReady from './helpers/isDbReady'
import { ok } from 'assert'

// Override these to apply serialization/deserialization on inputs/outputs
const deserialize = (item) => ({
  ...item,
  actionnaire: item.actionnaire || '',
  territoireProjet: item.territoireProjet || undefined,
  garantiesFinancieresDate: item.garantiesFinancieresDate || 0,
  garantiesFinancieresFile: item.garantiesFinancieresFile || '',
  garantiesFinancieresSubmittedOn: item.garantiesFinancieresSubmittedOn || 0,
  garantiesFinancieresSubmittedBy: item.garantiesFinancieresSubmittedBy || '',
})
const serialize = (item) => item

export default function makeProjectRepo({
  sequelize,
  appelOffreRepo,
}): ProjectRepo {
  const ProjectModel = sequelize.define('project', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    appelOffreId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    periodeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numeroCRE: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    familleId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nomCandidat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nomProjet: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    puissance: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    prixReference: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    evaluationCarbone: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    note: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    nomRepresentantLegal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    adresseProjet: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    codePostalProjet: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    communeProjet: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    departementProjet: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    territoireProjet: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    regionProjet: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    classe: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fournisseur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actionnaire: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    motifsElimination: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isFinancementParticipatif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    isInvestissementParticipatif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    engagementFournitureDePuissanceAlaPointe: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    notifiedOn: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    garantiesFinancieresSubmittedOn: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    garantiesFinancieresDate: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    garantiesFinancieresFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    garantiesFinancieresSubmittedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  })

  const ProjectEventModel = sequelize.define('projectEvent', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    before: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('before')
        let parsedValue = {}
        try {
          if (rawValue) parsedValue = JSON.parse(rawValue)
        } catch (e) {
          console.log(
            'ProjectEventModel failed to parse before rawValue:',
            rawValue
          )
        }
        return parsedValue
      },
      set(value) {
        this.setDataValue('before', JSON.stringify(value))
      },
      allowNull: false,
    },
    after: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('after')

        let parsedValue = {}
        try {
          if (rawValue) parsedValue = JSON.parse(rawValue)
        } catch (e) {
          console.log(
            'ProjectEventModel failed to parse after rawValue:',
            rawValue
          )
        }
        return parsedValue
      },
      set(value) {
        this.setDataValue('after', JSON.stringify(value))
      },
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modificationRequestId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  })

  ProjectModel.hasMany(ProjectEventModel)
  ProjectEventModel.belongsTo(ProjectModel, {
    foreignKey: 'projectId',
  })

  const _isDbReady = isDbReady({ sequelize })

  return Object.freeze({
    findById,
    findOne,
    findAll,
    findByUser,
    save,
    remove,
    addNotification,
    getUsers,
  })

  async function addAppelOffreToProject(project: Project): Promise<Project> {
    project.appelOffre = await appelOffreRepo.findById(
      project.appelOffreId,
      project.periodeId
    )
    return project
  }

  async function findById(
    id: Project['id'],
    includeHistory?: true
  ): OptionAsync<Project> {
    await _isDbReady

    try {
      const projectInDb = await ProjectModel.findByPk(id)
      if (!projectInDb) return None

      const projectInstance = makeProject(deserialize(projectInDb.get()))

      const projectWithAppelOffre = await addAppelOffreToProject(
        projectInstance.unwrap()
      )

      if (includeHistory) {
        projectWithAppelOffre.history = (
          await projectInDb.getProjectEvents()
        ).map((item) => item.get())
      }

      return Some(projectWithAppelOffre)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('Project.findById error', error)
      return None
    }
  }

  async function findOne(
    query: Record<string, any>
  ): Promise<Project | undefined> {
    await _isDbReady

    try {
      const projectInDb = await ProjectModel.findOne({ where: query })

      if (!projectInDb) return

      const projectInstance = makeProject(deserialize(projectInDb.get()))

      if (projectInstance.is_err()) throw projectInstance.unwrap_err()

      const projectWithAppelOffre = await addAppelOffreToProject(
        projectInstance.unwrap()
      )
      return projectWithAppelOffre
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('Project.findOne error', error)
    }
  }

  async function findAll(query?: Record<string, any>): Promise<Array<Project>>
  async function findAll(
    query: Record<string, any>,
    pagination: Pagination
  ): Promise<PaginatedList<Project>>
  async function findAll(
    query?: Record<string, any>,
    pagination?: Pagination
  ): Promise<PaginatedList<Project> | Array<Project>> {
    await _isDbReady

    try {
      const opts: any = {}
      if (query) {
        opts.where = query

        if (query.notifiedOn === -1) {
          // Special case which means != 0
          opts.where.notifiedOn = { [Op.ne]: 0 }
        }
      }

      if (pagination) {
        const { count, rows } = await ProjectModel.findAndCountAll({
          ...opts,
          ...paginate(pagination),
        })

        const projectsRaw = rows.map((item) => item.get()) // We need to use this instead of raw: true because of the include

        const deserializedItems = mapExceptError(
          projectsRaw,
          deserialize,
          'Project.findAll.deserialize error'
        )

        const projects = await Promise.all(
          deserializedItems.map(addAppelOffreToProject)
        )

        // const projects = mapIfOk(
        //   deserializedItems,
        //   makeProject,
        //   'Project.findAll.makeProject error'
        // )

        return makePaginatedList(projects, pagination, count)
      }

      const rows = await ProjectModel.findAll(opts)

      const projectsRaw = rows.map((item) => item.get()) // We need to use this instead of raw: true because of the include

      const deserializedItems = mapExceptError(
        projectsRaw,
        deserialize,
        'Project.findAll.deserialize error'
      )

      // return mapIfOk(
      //   deserializedItems,
      //   makeProject,
      //   'Project.findAll.makeProject error'
      // )
      return await Promise.all(deserializedItems.map(addAppelOffreToProject))
    } catch (error) {
      if (CONFIG.logDbErrors)
        console.log('Project.findAndCountAll error', error)
      return pagination ? makePaginatedList([], pagination, 0) : []
    }
  }

  async function findByUser(
    userId: User['id'],
    excludeUnnotified?: boolean
  ): Promise<Array<Project>> {
    try {
      const UserModel = sequelize.model('user')
      const userInstance = await UserModel.findByPk(userId)
      if (!userInstance) {
        if (CONFIG.logDbErrors)
          console.log('Cannot find user to get projects from')

        return []
      }

      const rawProjects = (
        await userInstance.getProjects({
          where: excludeUnnotified ? { notifiedOn: { [Op.ne]: 0 } } : {},
        })
      ).map((item) => item.get())

      const deserializedItems = mapExceptError(
        rawProjects,
        deserialize,
        'Project.findAll.deserialize error'
      )

      // return mapIfOk(
      //   deserializedItems,
      //   makeProject,
      //   'Project.findByUser.makeProject error'
      // )
      return await Promise.all(deserializedItems.map(addAppelOffreToProject))
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('User.findProjects error', error)
      return []
    }
  }

  async function save(project: Project): ResultAsync<Project> {
    await _isDbReady

    try {
      // Use a transaction to ensure the ProjectEvent and Project are saved together
      await sequelize.transaction(async (transaction: Transaction) => {
        // Check if the event history needs updating
        const newEvents = project.history?.filter((event) => event.isNew)
        if (newEvents && newEvents.length) {
          // New events found
          // Save them in the ProjectEvent table
          await Promise.all(
            newEvents
              .map((newEvent) =>
                ProjectEventModel.build({ ...newEvent, projectId: project.id })
              )
              .map((newEventInstance) => newEventInstance.save({ transaction }))
          )
        }

        await ProjectModel.upsert(project, { transaction })
      })

      return Ok(project)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('Project.save error', error)
      return Err(error)
    }
  }

  async function remove(id: Project['id']): ResultAsync<void> {
    await _isDbReady

    try {
      await ProjectModel.destroy({ where: { id } })
      return Ok(null)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('Project.remove error', error)
      return Err(error)
    }
  }

  async function addNotification(
    project: Project,
    notification: CandidateNotification
  ): ResultAsync<Project> {
    await _isDbReady

    try {
      const projectInstance = await ProjectModel.findByPk(project.id)

      if (!projectInstance) {
        throw new Error('Cannot find project to add notification to')
      }

      const CandidateNotificationModel = sequelize.model(
        'candidateNotification'
      )

      const candidateNotificationInstance = await CandidateNotificationModel.findByPk(
        notification.id
      )

      if (!candidateNotificationInstance)
        throw new Error('CandidateNotification not found')

      await projectInstance.addCandidateNotification(
        candidateNotificationInstance
      )

      return Ok(project)
    } catch (error) {
      if (CONFIG.logDbErrors)
        console.log('Project.addNotification error', error)
      return Err(error)
    }
  }

  async function getUsers(projectId: Project['id']): Promise<Array<User>> {
    await _isDbReady

    const projectInstance = await ProjectModel.findByPk(projectId)

    if (!projectInstance) {
      return []
    }

    return (await projectInstance.getUsers()).map((item) => item.get())
  }
}

export { makeProjectRepo }
