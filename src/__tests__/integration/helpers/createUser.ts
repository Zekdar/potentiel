import { credentialsRepo, userRepo } from '../../../dataAccess'
import { makeCredentials, makeUser, User } from '../../../entities'

interface CreateUserProps {
  email: User['email']
  fullName: User['fullName']
  password: string
  role: User['role']
}

async function createUser({
  email,
  fullName,
  password,
  role,
}: CreateUserProps) {
  // Create a user object
  const userResult = makeUser({
    fullName,
    email,
    role,
  })
  if (userResult.is_err()) {
    console.log(
      'resetDbForTests createUser failed at makeUser',
      userResult.unwrap_err()
    )
    return
  }
  const user = userResult.unwrap()

  // Create the credentials
  const credentialsData = {
    email,
    userId: user.id,
    password,
  }
  const credentialsResult = makeCredentials(credentialsData)

  if (credentialsResult.is_err()) {
    console.log(
      'resetDbForTests createUser failed at makeCredentials',
      credentialsResult.unwrap_err(),
      credentialsData
    )
    return
  }

  const credentials = credentialsResult.unwrap()

  // Insert the user in the database
  const userInsertion = await userRepo.insert(user)

  if (userInsertion.is_err()) {
    console.log(
      'resetDbForTests createUser failed at userRepo.insert',
      userInsertion.unwrap_err(),
      user
    )
    return
  }

  const credentialsInsertion = await credentialsRepo.insert(credentials)
  if (credentialsInsertion.is_err()) {
    console.log(
      'resetDbForTests createUser failed at credentialsRepo.insert',
      credentialsInsertion.unwrap_err()
    )
    return
  }

  return user.id
}

export { createUser }
