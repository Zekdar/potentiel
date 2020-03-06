import makeGetAdminLoginPage from './getAdminLoginPage'
import makeGetAdminDashboardPage from './getAdminDashboardPage'
import makeAuthentication from './authentication'
import makePostProjects from './postProjects'
import makeGetSendCandidateNotifications from './getSendCandidateNotifications'
import makeGetCandidateNotification from './getCandidateNotification'

import { userRepo } from '../dataAccess'

const getAdminLoginPage = makeGetAdminLoginPage()
const getAdminDashboardPage = makeGetAdminDashboardPage()
const { registerAuth, postLogin, ensureLoggedIn } = makeAuthentication({
  userRepo
})
const postProjects = makePostProjects()
const getSendCandidateNotifications = makeGetSendCandidateNotifications()
const getCandidateNotification = makeGetCandidateNotification()

const controller = Object.freeze({
  getAdminLoginPage,
  getAdminDashboardPage,
  registerAuth,
  postLogin,
  ensureLoggedIn,
  postProjects,
  getSendCandidateNotifications,
  getCandidateNotification
})

export default controller
export {
  getAdminLoginPage,
  getAdminDashboardPage,
  registerAuth,
  postLogin,
  ensureLoggedIn,
  postProjects,
  getSendCandidateNotifications,
  getCandidateNotification
}
