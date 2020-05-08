// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import 'cypress-file-upload'

Cypress.Commands.add('findContaining', (parentSelector, searchTerm) => {
  return cy.get(parentSelector).contains(parentSelector, searchTerm)
})

Cypress.Commands.add('logout', (parentSelector, searchTerm) => {
  return cy.request({
    method: 'GET',
    url: '/logout',
  })
})

Cypress.Commands.add('login', (email, password) => {
  return cy.request({
    method: 'POST',
    url: '/login',
    body: {
      email,
      password,
    },
    form: true,
  })
})

// Cypress.Commands.add('getTestId', (testId) => {
//   return cy.get('[data-testid=' + testId + ']')
// })

// Cypress.Commands.add(
//   'parentWithTestId',
//   { prevSubject: true },
//   (element, testId) => {
//     return element.parent('[data-testid=' + testId + ']')
//   }
// )

// Cypress.Commands.add('findTestId', { prevSubject: true }, (element, testId) => {
//   return element.find('[data-testid=' + testId + ']')
// })

Cypress.Commands.add('insertProjectsForUser', (projects) => {
  return cy.request({
    method: 'POST',
    url: '/test/addProjects',
    body: {
      projects,
    },
  })
})

Cypress.Commands.add('createUserWithEmail', (email) => {
  return cy.request({
    method: 'POST',
    url: '/test/createUserWithEmail',
    body: {
      email,
    },
  })
})

Cypress.Commands.add('checkUserAccessToProject', (email, nomProjet) => {
  return cy
    .request({
      method: 'POST',
      url: '/test/checkUserAccessToProject',
      body: {
        email,
        nomProjet,
      },
    })
    .then((res) => res.body)
})

Cypress.Commands.add('getProjectId', (nomProjet) => {
  return cy
    .request({
      method: 'GET',
      url: '/test/getProjectId?nomProjet=' + nomProjet,
    })
    .then((res) => res.body)
})

Cypress.Commands.add('getSentEmails', () => {
  return cy
    .request({
      method: 'GET',
      url: '/test/getSentEmails',
    })
    .then((res) => res.body.emails)
})
