import fs from 'fs'
import path from 'path'

import ReactDOMServer from 'react-dom/server'

import { User } from '../../entities'

import Header from '../components/header'

import Login from './login'
import UserListProjects from './userListProjects'
import UserListRequests from './userListRequests'
import AdminListProjects from './adminListProjects'
import AdminListRequests from './adminListRequests'
import AdminNotifyCandidates from './adminNotifyCandidates'
import ImportCandidates from './importCandidates'
import Signup from './signup'
import ModificationRequest from './modificationRequest'
import { HttpRequest } from '../../types'

const LoginPage = makePresenterPage(Login)
const AdminListProjectsPage = makePresenterPage(AdminListProjects)
const AdminListRequestsPage = makePresenterPage(AdminListRequests)
const AdminNotifyCandidatesPage = makePresenterPage(AdminNotifyCandidates)
const ImportCandidatesPage = makePresenterPage(ImportCandidates)
const UserListProjectsPage = makePresenterPage(UserListProjects)
const UserListRequestsPage = makePresenterPage(UserListRequests)
const SignupPage = makePresenterPage(Signup)
const ModificationRequestPage = makePresenterPage(ModificationRequest)

export {
  LoginPage,
  AdminListProjectsPage,
  AdminListRequestsPage,
  ImportCandidatesPage,
  UserListProjectsPage,
  UserListRequestsPage,
  SignupPage,
  ModificationRequestPage,
  AdminNotifyCandidatesPage
}

interface HasRequest {
  request: HttpRequest
}

/**
 * Turn a Page Component (pure) into a presenter that returns a full HTML page
 * @param pageComponent
 */
function makePresenterPage<T extends HasRequest>(
  pageComponent: (pageProps: T) => JSX.Element
) {
  return (props: T): string =>
    insertIntoHTMLTemplate(
      ReactDOMServer.renderToStaticMarkup(Header(props)) +
        ReactDOMServer.renderToStaticMarkup(pageComponent(props))
    )
}

function makeRawPage(pageComponent) {
  return (props?: any) =>
    ReactDOMServer.renderToStaticMarkup(pageComponent(props))
}

const headerPartial = fs.readFileSync(
  path.resolve(__dirname, '../template/header.html.partial')
)
const footerPartial = fs.readFileSync(
  path.resolve(__dirname, '../template/footer.html.partial')
)

/**
 * Insert html contents into the full template
 * @param htmlContents
 */
function insertIntoHTMLTemplate(htmlContents: string): string {
  return headerPartial + htmlContents + footerPartial
}
