import { User, Project } from '../entities'

export type UserRepo = {
  findById: ({ id: string }) => Promise<User | null>
  insert: (user: User) => Promise<string>
  findProjects: (user: User) => Promise<Array<Project>>
  addProject: (userId: string, projectId: string) => Promise<void>
}
