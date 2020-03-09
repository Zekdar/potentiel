import { Project } from './entities'

const withProjectId = (url: string) => (projectId: Project['id']) =>
  url + '?projectId=' + projectId

export default {
  LOGIN: '/login.html',
  LOGIN_ACTION: '/login',
  LOGOUT_ACTION: '/logout',
  REDIRECT_BASED_ON_ROLE: '/go-to-user-dashboard',
  SIGNUP: '/enregistrement.html',
  SIGNUP_ACTION: '/enregistrement',
  ADMIN_DASHBOARD: '/admin/dashboard.html',
  IMPORT_PROJECTS_ACTION: '/admin/importProjects',
  CANDIDATE_NOTIFICATION: '/admin/candidate-notification.html',
  SEND_NOTIFICATIONS_ACTION: '/admin/sendCandidateNotifications',
  USER_DASHBOARD: '/mes-projets.html',
  DEPOSER_RECOURS: withProjectId('/deposer-recours.html'),
  TELECHARGER_ATTESTATION: withProjectId('/attestation.pdf'),
  DEMANDE_DELAIS: withProjectId('/demande-delais.html'),
  CHANGER_FOURNISSEUR: withProjectId('/changer-fournisseur.html'),
  CHANGER_ACTIONNAIRE: withProjectId('/changer-actionnaire.html'),
  CHANGER_PUISSANCE: withProjectId('/changer-puissance.html'),
  DEMANDER_ABANDON: withProjectId('/abandon.html')
}
