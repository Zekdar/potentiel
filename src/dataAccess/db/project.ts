import { DataTypes, Op, Transaction } from 'sequelize'
import { ProjectRepo, ProjectFilters } from '../'
import {
  Project,
  User,
  makeProject,
  AppelOffre,
  Periode,
  Famille,
  DREAL,
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
import _ from 'lodash'
import { QueryTypes } from 'sequelize'

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

const initSearchIndex = async (sequelize) => {
  // Set up the virtual table
  try {
    await sequelize.query(
      'CREATE VIRTUAL TABLE IF NOT EXISTS project_search USING fts3(id UUID, nomCandidat VARCHAR(255), nomProjet VARCHAR(255), nomRepresentantLegal VARCHAR(255), email VARCHAR(255), adresseProjet VARCHAR(255), codePostalProjet VARCHAR(255), communeProjet VARCHAR(255), departementProjet VARCHAR(255), regionProjet VARCHAR(255), numeroCRE VARCHAR(255));'
    )
    console.log('Done create project_search virtual table')
  } catch (error) {
    console.error('Unable to create project_search virtual table', error)
  }
}

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
    details: {
      type: DataTypes.JSON,
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

  const _isDbReady = isDbReady({ sequelize }).then(() =>
    initSearchIndex(sequelize)
  )

  return Object.freeze({
    findById,
    findOne,
    findAll,
    findByUser,
    save,
    remove,
    getUsers,
    findExistingAppelsOffres,
    findExistingFamillesForAppelOffre,
    findExistingPeriodesForAppelOffre,
    searchForUser,
    findAllForUser,
    searchForRegions,
  })

  async function addAppelOffreToProject(project: Project): Promise<Project> {
    project.appelOffre = await appelOffreRepo.findById(
      project.appelOffreId,
      project.periodeId
    )

    project.famille = project.appelOffre?.familles.find(
      (famille) => famille.id === project.familleId
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

  async function findOne(query: ProjectFilters): Promise<Project | undefined> {
    await _isDbReady

    try {
      const projectInDb = await ProjectModel.findOne({
        where: query,
      })

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

  function makeSelectorsForQuery(query?: ProjectFilters) {
    const opts: any = {}

    if (query) {
      opts.where = {}

      if ('isNotified' in query) {
        opts.where.notifiedOn = query.isNotified ? { [Op.ne]: 0 } : 0
      }

      if ('hasGarantiesFinancieres' in query) {
        opts.where.garantiesFinancieresSubmittedOn = query.hasGarantiesFinancieres
          ? { [Op.ne]: 0 }
          : 0
      }

      if ('isClasse' in query) {
        opts.where.classe = query.isClasse ? 'Classé' : 'Eliminé'
      }

      // Region can be of shape 'region1 / region2' so equality does not work
      // if (typeof query.regionProjet === 'string') {
      //   opts.where.regionProjet = {
      //     [Op.substring]: query.regionProjet,
      //   }
      // } else if (
      //   Array.isArray(query.regionProjet) &&
      //   query.regionProjet.length
      // ) {
      //   opts.where.regionProjet = {
      //     [Op.or]: query.regionProjet.map((region) => ({
      //       [Op.substring]: region,
      //     })),
      //   }
      // }
    }

    return opts
  }

  async function getProjectIdsForUser(
    userId: User['id'],
    filters?: ProjectFilters
  ): Promise<Project['id'][]> {
    await _isDbReady

    const UserModel = sequelize.model('user')
    const userInstance = await UserModel.findByPk(userId)
    if (!userInstance) {
      if (CONFIG.logDbErrors)
        console.log('Cannot find user to get projects from')

      return []
    }

    return (await userInstance.getProjects(makeSelectorsForQuery(filters))).map(
      (item) => item.get().id
    )
  }

  async function searchInIds(term: string, projectIds: Project['id'][]) {
    const projects = await sequelize.query(
      'SELECT id from project_search WHERE project_search MATCH :recherche AND id IN (:projectIds);',
      {
        replacements: {
          recherche: term
            .split(' ')
            .map((token) => '*' + token + '*')
            .join(' '),
          projectIds,
        },
        type: QueryTypes.SELECT,
      }
    )

    return projects.map((item) => item.id)
  }

  async function getProjectsWithIds(
    projectIds: Project['id'][],
    pagination: Pagination
  ): Promise<PaginatedList<Project>> {
    const { count, rows } = await ProjectModel.findAndCountAll({
      where: {
        id: projectIds,
      },
      ...paginate(pagination),
    })

    const projectsRaw = rows
      .map((item) => item.get())
      // Double check the list of projects
      .filter((project) => projectIds.includes(project.id))

    if (projectsRaw.length !== rows.length) {
      console.log(
        'WARNING: getProjectsWithIds had intermediate results that did not match user projects. Something must be wrong in the query.'
      )
    }

    const deserializedItems = mapExceptError(
      projectsRaw,
      deserialize,
      'Project.getProjectsWithIds.deserialize error'
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

  async function searchForUser(
    userId: User['id'],
    terms: string,
    pagination: Pagination,
    filters?: ProjectFilters
  ): Promise<PaginatedList<Project>> {
    await _isDbReady
    try {
      const filteredUserProjectIds = await getProjectIdsForUser(userId, filters)

      if (!filteredUserProjectIds.length)
        return makePaginatedList([], pagination, 0)

      const searchedUserProjectIds = await searchInIds(
        terms,
        filteredUserProjectIds
      )

      if (!searchedUserProjectIds.length)
        return makePaginatedList([], pagination, 0)

      return getProjectsWithIds(searchedUserProjectIds, pagination)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('Project.searchForUser error', error)
      return makePaginatedList([], pagination, 0)
    }
  }

  async function findAllForUser(
    userId: User['id'],
    pagination: Pagination,
    filters?: ProjectFilters
  ): Promise<PaginatedList<Project>> {
    await _isDbReady
    try {
      const filteredUserProjectIds = await getProjectIdsForUser(userId, filters)

      if (!filteredUserProjectIds.length)
        return makePaginatedList([], pagination, 0)

      return getProjectsWithIds(filteredUserProjectIds, pagination)
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('Project.findAllForUser error', error)
      return makePaginatedList([], pagination, 0)
    }
  }

  async function searchInRegions(term: string, regions: DREAL | DREAL[]) {
    const termQuery = term
      .split(' ')
      .map((token) => '*' + token + '*')
      .join(' OR ')
    const regionQuery = Array.isArray(regions)
      ? regions.map((region) => 'regionProjet:' + region).join(' OR ')
      : 'regionProjet:' + regions
    const projects = await sequelize.query(
      'SELECT id FROM project_search WHERE project_search MATCH :query;',
      {
        replacements: {
          query: '(' + termQuery + ') AND (' + regionQuery + ')',
        },
        type: QueryTypes.SELECT,
      }
    )

    return projects.map((item) => item.id)
  }

  async function searchForRegions(
    regions: DREAL | DREAL[],
    terms: string,
    pagination: Pagination,
    filters?: ProjectFilters
  ): Promise<PaginatedList<Project>> {
    await _isDbReady
    try {
      const searchedRegionProjectIds = await searchInRegions(terms, regions)

      if (!searchedRegionProjectIds.length)
        return makePaginatedList([], pagination, 0)

      const opts = filters ? makeSelectorsForQuery(filters) : { where: {} }

      opts.where.id = searchedRegionProjectIds

      const { count, rows } = await ProjectModel.findAndCountAll({
        ...opts,
        ...paginate(pagination),
      })

      const projectsRaw = rows
        .map((item) => item.get())
        // Double check the list of projects
        .filter((project) =>
          project.regionProjet
            .split(' / ')
            .some((region) => regions.includes(region))
        )

      if (projectsRaw.length !== rows.length) {
        console.log(
          'WARNING: searchForRegions had intermediate results that did not match region. Something must be wrong in the query.'
        )
      }

      const deserializedItems = mapExceptError(
        projectsRaw,
        deserialize,
        'Project.getProjectsWithIds.deserialize error'
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
    } catch (error) {
      if (CONFIG.logDbErrors) console.log('Project.searchForUser error', error)
      return makePaginatedList([], pagination, 0)
    }
  }

  async function findAll(query?: ProjectFilters): Promise<Array<Project>>
  async function findAll(
    query: ProjectFilters,
    pagination: Pagination
  ): Promise<PaginatedList<Project>>
  async function findAll(
    query?: ProjectFilters,
    pagination?: Pagination
  ): Promise<PaginatedList<Project> | Array<Project>> {
    await _isDbReady
    try {
      const opts = makeSelectorsForQuery(query)

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

  async function indexProject(project: Project) {
    // update the search index (delete then insert)
    await sequelize.query('DELETE FROM project_search where id is :id;', {
      replacements: project,
      type: QueryTypes.DELETE,
    })
    await sequelize.query(
      'INSERT INTO project_search(id, nomCandidat, nomProjet, nomRepresentantLegal, email, adresseProjet, codePostalProjet, communeProjet, departementProjet, regionProjet, numeroCRE) VALUES(:id, :nomCandidat, :nomProjet, :nomRepresentantLegal, :email, :adresseProjet, :codePostalProjet, :communeProjet, :departementProjet, :regionProjet, :numeroCRE);',
      {
        replacements: project,
        type: QueryTypes.INSERT,
      }
    )
  }

  async function updateProjectHistory(project: Project) {
    // Check if the event history needs updating
    const newEvents = project.history?.filter((event) => event.isNew)
    if (newEvents && newEvents.length) {
      // New events found
      // Save them in the ProjectEvent table
      try {
        await Promise.all(
          newEvents
            .map((newEvent) => ({
              ...newEvent,
              projectId: project.id,
            }))
            .map((newEvent) =>
              ProjectEventModel.create(newEvent /*, { transaction }*/)
            )
        )
      } catch (error) {
        console.log('projectRepo.save error when saving newEvents', error)
      }
    }
  }

  async function save(project: Project): ResultAsync<Project> {
    await _isDbReady

    try {
      const existingProject = await ProjectModel.findByPk(project.id)

      if (existingProject) {
        await existingProject.update(project)
      } else {
        await ProjectModel.create(project)
      }

      await indexProject(project)

      await updateProjectHistory(project)

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

  async function getUsers(projectId: Project['id']): Promise<Array<User>> {
    await _isDbReady

    const projectInstance = await ProjectModel.findByPk(projectId)

    if (!projectInstance) {
      return []
    }

    return (await projectInstance.getUsers()).map((item) => item.get())
  }

  async function findExistingAppelsOffres(
    query?: ProjectFilters
  ): Promise<Array<AppelOffre['id']>> {
    await _isDbReady

    const opts = await makeSelectorsForQuery(query)

    const appelsOffres = await ProjectModel.findAll({
      attributes: ['appelOffreId'],
      group: ['appelOffreId'],
      ...opts,
    })

    return appelsOffres.map((item) => item.get().appelOffreId)
  }

  async function findExistingPeriodesForAppelOffre(
    appelOffreId: AppelOffre['id'],
    query?: ProjectFilters
  ): Promise<Array<Periode['id']>> {
    const opts = makeSelectorsForQuery(query)
    opts.where.appelOffreId = appelOffreId

    const periodes = await ProjectModel.findAll({
      attributes: ['periodeId'],
      group: ['periodeId'],
      ...opts,
    })

    return periodes.map((item) => item.get().periodeId)
  }

  async function findExistingFamillesForAppelOffre(
    appelOffreId: AppelOffre['id'],
    query?: ProjectFilters
  ): Promise<Array<Famille['id']>> {
    const opts = makeSelectorsForQuery(query)
    opts.where.appelOffreId = appelOffreId

    const familles = await ProjectModel.findAll({
      attributes: ['familleId'],
      group: ['familleId'],
      ...opts,
    })

    return familles.map((item) => item.get().familleId)
  }
}

export { makeProjectRepo }
