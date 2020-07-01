import makeSignup, {
  PASSWORD_MISMATCH_ERROR,
  EMAIL_USED_ERROR,
  USER_INFO_ERROR,
  MISSING_ADMISSION_KEY_ERROR,
} from './signup'

import makeLogin from './login'

import {
  userRepo,
  credentialsRepo,
  projectAdmissionKeyRepo,
  projectRepo,
  resetDatabase,
} from '../dataAccess/inMemory'
import {
  makeCredentials,
  makeProjectAdmissionKey,
  makeProject,
} from '../entities'
import makeFakeProject from '../__tests__/fixtures/project'

const signup = makeSignup({
  userRepo,
  credentialsRepo,
  projectAdmissionKeyRepo,
  projectRepo,
})

const login = makeLogin({
  userRepo,
  credentialsRepo,
})

const makePhonySignup = (overrides = {}) => ({
  password: 'password',
  confirmPassword: 'password',
  fullName: 'firstName lastName',
  email: 'email@email.com',
  projectAdmissionKey: 'projectAdmissionKey',
  ...overrides,
})

describe('signup use-case', () => {
  beforeEach(async () => {
    resetDatabase()
    const credentialsResult = makeCredentials({
      email: 'existing@email.com',
      userId: '1',
      hash: 'qsdsqdqsdqs',
    })
    expect(credentialsResult.is_ok())
    if (!credentialsResult.is_ok()) return

    await credentialsRepo.insert(credentialsResult.unwrap())
  })

  it('should create a new user with all the projects with the same email attached if user used the address the notification was sent to', async () => {
    const sameEmailEverywhere = 'one@address.com'
    // Create two fake projects, with the same email
    await Promise.all(
      [
        makeFakeProject({ id: '1', email: sameEmailEverywhere }),
        makeFakeProject({ id: '2', email: sameEmailEverywhere }),
      ]
        .map(makeProject)
        .filter((item) => item.is_ok())
        .map((item) => item.unwrap())
        .map(projectRepo.save)
    )

    const [project, otherProject] = await projectRepo.findAll()

    expect(project).toBeDefined()

    // Add a projectAdmissionKey
    const [projectAdmissionKey] = (
      await Promise.all(
        [
          {
            id: 'phonyProjectAdmissionKey',
            email: sameEmailEverywhere,
            fullName: 'fullname',
          },
        ]
          .map(makeProjectAdmissionKey)
          .filter((item) => item.is_ok())
          .map((item) => item.unwrap())
          .map(projectAdmissionKeyRepo.save)
      )
    )
      .filter((item) => item.is_ok())
      .map((item) => item.unwrap())

    expect(projectAdmissionKey).toBeDefined()
    if (!projectAdmissionKey) return

    // Signup with the same email address
    const phonySignup = makePhonySignup({
      projectAdmissionKey: projectAdmissionKey.id,
      email: sameEmailEverywhere,
    })

    const signupResult = await signup(phonySignup)

    expect(signupResult.is_ok()).toBeTruthy()
    if (!signupResult.is_ok()) return

    // Check if login works
    const userResult = await login({
      email: phonySignup.email,
      password: phonySignup.password,
    })

    expect(userResult.is_ok()).toBeTruthy()
    if (!userResult.is_ok()) return

    const user = userResult.unwrap()
    expect(user).toEqual(
      expect.objectContaining({
        fullName: phonySignup.fullName,
      })
    )

    if (!user) return

    // Link the user account to the projectAdmissionKey that was used
    expect(user.projectAdmissionKey).toEqual(projectAdmissionKey.id)

    // Make sure the projectAdmissionKey.lastUsedAt is updated
    const updatedProjectAdmissionKeyRes = await projectAdmissionKeyRepo.findById(
      projectAdmissionKey.id
    )
    expect(updatedProjectAdmissionKeyRes.is_some()).toEqual(true)
    const updatedProjectAdmissionKey = updatedProjectAdmissionKeyRes.unwrap()
    if (!updatedProjectAdmissionKey) return
    expect(updatedProjectAdmissionKey.lastUsedAt).toBeDefined()
    if (!updatedProjectAdmissionKey.lastUsedAt) return
    expect(updatedProjectAdmissionKey.lastUsedAt / 1000).toBeCloseTo(
      Date.now() / 1000,
      0
    )

    // Check if the project has been attached
    expect(await userRepo.hasProject(user.id, project.id)).toEqual(true)
    expect(await userRepo.hasProject(user.id, otherProject.id)).toEqual(true)
  })

  it('should create a new user with all the projects that have a projectAdmissionKey for the same email', async () => {
    const sameEmailEverywhere = 'one@address.com'

    // Create two fake projects, with another email
    await Promise.all(
      [
        makeFakeProject({ nomProjet: 'project1', email: 'other@test.test' }),
        makeFakeProject({
          nomProjet: 'project2',
          email: 'yetAnother@test.test',
        }),
      ]
        .map(makeProject)
        .filter((item) => item.is_ok())
        .map((item) => item.unwrap())
        .map(projectRepo.save)
    )

    const [project, otherProject] = await projectRepo.findAll()

    expect(project).toBeDefined()
    expect(otherProject).toBeDefined()
    if (!project || !otherProject) return

    const [projectAdmissionKey, otherProjectAdmissionKey] = (
      await Promise.all(
        [
          // Create a project admission key for each fake project
          ...[project, otherProject].map((project) => ({
            email: sameEmailEverywhere,
            fullName: '',
            projectId: project.id,
          })),
          // Also create an admission key for a phony project to check if it is ignored
          {
            email: 'another@test.test',
            projectId: 'shouldBeIgnored',
            fullName: '',
          },
        ]
          .map(makeProjectAdmissionKey)
          .filter((item) => item.is_ok())
          .map((item) => item.unwrap())
          .map(projectAdmissionKeyRepo.save)
      )
    )
      .filter((item) => item.is_ok())
      .map((item) => item.unwrap())

    expect(projectAdmissionKey).toBeDefined()
    expect(otherProjectAdmissionKey).toBeDefined()
    if (!projectAdmissionKey || !otherProjectAdmissionKey) return

    // Signup with the same email address
    const phonySignup = makePhonySignup({
      projectAdmissionKey: projectAdmissionKey.id,
      email: sameEmailEverywhere,
    })

    const signupResult = await signup(phonySignup)

    expect(signupResult.is_ok()).toBeTruthy()
    if (signupResult.is_err()) return

    // Check if login works
    const userResult = await login({
      email: phonySignup.email,
      password: phonySignup.password,
    })

    expect(userResult.is_ok()).toBeTruthy()
    if (!userResult.is_ok()) return

    const user = userResult.unwrap()
    expect(user).toEqual(
      expect.objectContaining({
        fullName: phonySignup.fullName,
      })
    )

    if (!user) return

    // Link the user account to the projectAdmissionKey that was used
    expect(user.projectAdmissionKey).toEqual(projectAdmissionKey.id)

    // Make sure the projectAdmissionKey.lastUsedAt is updated
    const updatedProjectAdmissionKeyRes = await projectAdmissionKeyRepo.findById(
      projectAdmissionKey.id
    )
    expect(updatedProjectAdmissionKeyRes.is_some()).toEqual(true)
    const updatedProjectAdmissionKey = updatedProjectAdmissionKeyRes.unwrap()
    if (!updatedProjectAdmissionKey) return
    expect(updatedProjectAdmissionKey.lastUsedAt).toBeDefined()
    if (!updatedProjectAdmissionKey.lastUsedAt) return
    expect(updatedProjectAdmissionKey.lastUsedAt / 1000).toBeCloseTo(
      Date.now() / 1000,
      0
    )

    // Check if the project has been attached
    expect(await userRepo.hasProject(user.id, project.id)).toEqual(true)
    expect(await userRepo.hasProject(user.id, otherProject.id)).toEqual(true)
  })

  it('should create a new user with dreal role, with the provided email, and attached to the desired dreal if projectAdmissionKey has a dreal', async () => {
    // Add a projectAdmissionKey
    const [projectAdmissionKey] = (
      await Promise.all(
        [
          {
            id: 'phonyProjectAdmissionKey',
            email: 'phony@email.com',
            fullName: 'fullname',
            dreal: 'Corse',
          },
        ]
          .map(makeProjectAdmissionKey)
          .filter((item) => item.is_ok())
          .map((item) => item.unwrap())
          .map(projectAdmissionKeyRepo.save)
      )
    )
      .filter((item) => item.is_ok())
      .map((item) => item.unwrap())

    expect(projectAdmissionKey).toBeDefined()
    if (!projectAdmissionKey) return

    // Signup with the same email address
    const phonySignup = makePhonySignup({
      projectAdmissionKey: projectAdmissionKey.id,
      email: 'another@email.com',
    })

    const signupResult = await signup(phonySignup)

    expect(signupResult.is_ok()).toBeTruthy()
    if (!signupResult.is_ok()) return

    const createdUser = signupResult.unwrap()
    expect(createdUser).toBeDefined()
    if (!createdUser) return
    expect(createdUser.role).toEqual('dreal')
    expect(createdUser.email).toEqual('another@email.com')

    // Link the user account to the projectAdmissionKey that was used
    expect(createdUser.projectAdmissionKey).toEqual(projectAdmissionKey.id)

    // Make sure the projectAdmissionKey.lastUsedAt is updated
    const updatedProjectAdmissionKeyRes = await projectAdmissionKeyRepo.findById(
      projectAdmissionKey.id
    )
    expect(updatedProjectAdmissionKeyRes.is_some()).toEqual(true)
    const updatedProjectAdmissionKey = updatedProjectAdmissionKeyRes.unwrap()
    if (!updatedProjectAdmissionKey) return
    expect(updatedProjectAdmissionKey.lastUsedAt).toBeDefined()
    if (!updatedProjectAdmissionKey.lastUsedAt) return
    expect(updatedProjectAdmissionKey.lastUsedAt / 1000).toBeCloseTo(
      Date.now() / 1000,
      0
    )

    const userDreals = await userRepo.findDrealsForUser(createdUser.id)
    expect(userDreals).toHaveLength(1)
    expect(userDreals[0]).toEqual('Corse')
  })

  it("should return an error if passwords don't match", async () => {
    const phonySignup = makePhonySignup({
      password: 'a',
      confirmPassword: 'b',
    })
    const signupResult = await signup(phonySignup)

    expect(signupResult.is_err())
    if (!signupResult.is_err()) return

    expect(signupResult.unwrap_err()).toEqual(
      new Error(PASSWORD_MISMATCH_ERROR)
    )
  })

  it('should return an error if fullName is missing', async () => {
    // Add a projectAdmissionKey
    const [projectAdmissionKey] = (
      await Promise.all(
        [
          {
            id: 'projectAdmissionKey',
            email: 'bla@bli.com',
            fullName: 'fullname',
          },
        ]
          .map(makeProjectAdmissionKey)
          .filter((item) => item.is_ok())
          .map((item) => item.unwrap())
          .map(projectAdmissionKeyRepo.save)
      )
    )
      .filter((item) => item.is_ok())
      .map((item) => item.unwrap())

    expect(projectAdmissionKey).toBeDefined()
    if (!projectAdmissionKey) return

    const phonySignup = makePhonySignup({
      fullName: null,
      projectAdmissionKey: projectAdmissionKey.id,
    })
    const signupResult = await signup(phonySignup)

    expect(signupResult.is_err())
    if (!signupResult.is_err()) return

    expect(signupResult.unwrap_err()).toEqual(new Error(USER_INFO_ERROR))
  })

  it('should return an error if projectAdmissionKey is missing', async () => {
    const phonySignup = makePhonySignup({ projectAdmissionKey: null })
    const signupResult = await signup(phonySignup)

    expect(signupResult.is_err()).toEqual(true)
    if (!signupResult.is_err()) return

    expect(signupResult.unwrap_err()).toEqual(
      new Error(MISSING_ADMISSION_KEY_ERROR)
    )
  })

  it('should return an error if email is already used', async () => {
    // Add a projectAdmissionKey
    const [projectAdmissionKey] = (
      await Promise.all(
        [
          {
            id: 'projectAdmissionKey',
            email: 'existing@email.com',
            fullName: 'fullname',
          },
        ]
          .map(makeProjectAdmissionKey)
          .filter((item) => item.is_ok())
          .map((item) => item.unwrap())
          .map(projectAdmissionKeyRepo.save)
      )
    )
      .filter((item) => item.is_ok())
      .map((item) => item.unwrap())

    expect(projectAdmissionKey).toBeDefined()
    if (!projectAdmissionKey) return

    const phonySignup = makePhonySignup({
      projectAdmissionKey: projectAdmissionKey.id,
    })
    const signupResult = await signup(phonySignup)

    expect(signupResult.is_err()).toEqual(true)
    if (!signupResult.is_err()) return

    expect(signupResult.unwrap_err()).toEqual(new Error(EMAIL_USED_ERROR))
  })
})
