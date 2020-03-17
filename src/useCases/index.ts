import { v1 as uuidv1 } from 'uuid'

import makeLogin from './login'
import makeImportProjects from './importProjects'
import makeListProjects from './listProjects'
import makeListUserProjects from './listUserProjects'
import makeSendCandidateNotifications from './sendCandidateNotifications'
import makeShowNotification from './showNotification'
import makeSignup from './signup'

import {
  credentialsRepo,
  userRepo,
  projectRepo,
  candidateNotificationRepo,
  projectAdmissionKeyRepo
} from '../dataAccess'

const login = makeLogin({
  credentialsRepo,
  userRepo
})

const importProjects = makeImportProjects({
  projectRepo
})

const listProjects = makeListProjects({ projectRepo })

const sendCandidateNotifications = makeSendCandidateNotifications({
  projectRepo,
  userRepo,
  credentialsRepo,
  makeUuid: uuidv1
})

const showNotification = makeShowNotification({
  candidateNotificationRepo
})

const signup = makeSignup({
  userRepo,
  credentialsRepo,
  projectAdmissionKeyRepo
})

const listUserProjects = makeListUserProjects({ userRepo })

const useCases = Object.freeze({
  login,
  importProjects,
  listProjects,
  listUserProjects,
  sendCandidateNotifications,
  showNotification,
  signup
})

export default useCases
export {
  login,
  importProjects,
  listProjects,
  listUserProjects,
  sendCandidateNotifications,
  showNotification,
  signup
}
