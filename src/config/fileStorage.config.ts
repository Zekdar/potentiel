import {
  LocalFileStorageService,
  ObjectStorageFileStorageService,
} from '../infra/file'
import { FileService, FileStorageService } from '../modules/file'
import { isStagingEnv, isProdEnv } from './env.config'
import { fileRepo } from './repos.config'
import { shouldUserAccessProject } from './useCases.config'

let fileStorageService: FileStorageService
if (isStagingEnv || isProdEnv) {
  const authUrl = process.env.OS_AUTH_URL
  const region = process.env.OS_REGION
  const username = process.env.OS_USERNAME
  const password = process.env.OS_PASSWORD
  const container = process.env.OS_CONTAINER

  if (!authUrl || !region || !username || !password || !container) {
    console.log(
      'Cannot start ObjectStorageFileStorageService because of missing environment variables (OS_AUTH_URL, OS_REGION, OS_USERNAME, OS_PASSWORD, OS_CONTAINER)'
    )
    process.exit(1)
  }

  fileStorageService = new ObjectStorageFileStorageService(
    {
      provider: 'openstack',
      keystoneAuthVersion: 'v3',
      authUrl,
      region,
      username,
      password,
      // @ts-ignore
      domainId: 'default',
    },
    container
  )

  console.log(
    'FileService will be using ObjectStorage on container ' + container
  )
} else {
  console.log('FileService will be using LocalFileStorage is userData/')
  fileStorageService = new LocalFileStorageService('userData')
}

export const fileService = new FileService(
  fileStorageService,
  fileRepo,
  shouldUserAccessProject
)
