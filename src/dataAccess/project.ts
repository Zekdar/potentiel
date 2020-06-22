import { Project, User, AppelOffre, Famille, Periode } from '../entities'
import { OptionAsync, ResultAsync, Pagination, PaginatedList } from '../types'

export type ProjectRepo = {
  findById: (
    id: Project['id'],
    includeHistory?: boolean
  ) => OptionAsync<Project>
  findOne(query: Record<string, any>): Promise<Project | undefined>
  findAll(query?: Record<string, any>): Promise<Array<Project>>
  findAll(
    query: Record<string, any>,
    pagination: Pagination
  ): Promise<PaginatedList<Project>>
  findExistingAppelsOffres(): Promise<Array<AppelOffre['id']>>
  findExistingPeriodesForAppelOffre(
    appelOffreId: AppelOffre['id']
  ): Promise<Array<Periode['id']>>
  findExistingFamillesForAppelOffre(
    appelOffreId: AppelOffre['id']
  ): Promise<Array<Famille['id']>>
  findByUser: (
    userId: User['id'],
    excludeUnnotified?: boolean
  ) => Promise<Array<Project>>
  remove: (projectId: Project['id']) => ResultAsync<void>
  save: (project: Project) => ResultAsync<Project>
  getUsers: (projectId: Project['id']) => Promise<Array<User>>
}
