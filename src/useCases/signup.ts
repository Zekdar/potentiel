import {
  User,
  makeUser,
  Credentials,
  makeCredentials,
  ProjectAdmissionKey,
  makeProjectAdmissionKey
} from '../entities'
import {
  UserRepo,
  CredentialsRepo,
  ProjectAdmissionKeyRepo,
  ProjectRepo
} from '../dataAccess'
import _ from 'lodash'

interface MakeUseCaseProps {
  userRepo: UserRepo
  credentialsRepo: CredentialsRepo
  projectAdmissionKeyRepo: ProjectAdmissionKeyRepo
  projectRepo: ProjectRepo
}

interface CallUseCaseProps {
  projectId?: string
  projectAdmissionKey?: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export const PASSWORD_MISMATCH_ERROR = 'Les mots de passe ne correspondent pas.'
export const EMAIL_USED_ERROR = 'Email déjà utilisé pour un autre compte'
export const USER_INFO_ERROR = 'Prénom ou nom manquants'
export const MISSING_PROJECT_ID_ERROR =
  'Impossible de lier ce compte utilisateur au projet associé.'
export const WRONG_PROJECT_ADMISSION_KEY_ERROR = 'Lien de projet erroné'

export default function makeSignup({
  userRepo,
  credentialsRepo,
  projectAdmissionKeyRepo,
  projectRepo
}: MakeUseCaseProps) {
  return async function signup({
    projectId,
    projectAdmissionKey,
    firstName,
    lastName,
    email,
    password,
    confirmPassword
  }: CallUseCaseProps): Promise<User['id']> {
    // Check if passwords match
    if (!password || password !== confirmPassword) {
      throw new Error(PASSWORD_MISMATCH_ERROR)
    }

    // Create a user object
    let userId: User['id']
    try {
      userId = await userRepo.insert(
        makeUser({ firstName, lastName, role: 'porteur-projet' })
      )
    } catch (e) {
      throw new Error(USER_INFO_ERROR)
    }

    // Create a credentials object
    try {
      const existingCredential = await credentialsRepo.findByEmail({ email })

      if (existingCredential) {
        throw new Error(EMAIL_USED_ERROR)
      }

      await credentialsRepo.insert(makeCredentials({ email, userId, password }))
    } catch (e) {
      // Remove user that was created
      await userRepo.remove(userId)
      throw new Error(EMAIL_USED_ERROR)
    }

    if (projectAdmissionKey) {
      if (!projectId) {
        throw new Error(MISSING_PROJECT_ID_ERROR)
      }

      const projectAdmissionKeyInstance = await projectAdmissionKeyRepo.findById(
        { id: projectAdmissionKey }
      )

      if (!projectAdmissionKeyInstance) {
        throw new Error(WRONG_PROJECT_ADMISSION_KEY_ERROR)
      }

      if (projectAdmissionKeyInstance.projectId !== projectId) {
        throw new Error(WRONG_PROJECT_ADMISSION_KEY_ERROR)
      }

      if (email === projectAdmissionKeyInstance.email) {
        // User validated his email address by registering with it
        // Add all projects that have that email
        const projectsWithSameEmail = await projectRepo.findAll({ email })
        await Promise.all(
          projectsWithSameEmail.map(project =>
            userRepo.addProject(userId, project.id)
          )
        )
      } else {
        // User used another email address
        // Only link the user with the project from the admisssion key
        await userRepo.addProject(userId, projectId)
      }
    }

    return userId
  }
}
