import { UniqueEntityID } from '../../core/domain'
import { UnwrapForTest } from '../../core/utils'
import { appelsOffreStatic } from '../../dataAccess/inMemory/appelOffre'
import { makeUser } from '../../entities'
import { UnwrapForTest as OldUnwrapForTest } from '../../types'
import makeFakeProject from '../../__tests__/fixtures/project'
import makeFakeUser from '../../__tests__/fixtures/user'
import { StoredEvent } from '../eventStore'
import {
  ProjectCertificateGenerated,
  ProjectCertificateUploaded,
  ProjectImported,
  ProjectNotified,
} from './events'
import { makeProject } from './Project'

const projectId = new UniqueEntityID('project1')
const appelOffreId = 'Fessenheim'
const periodeId = '2'
const fakeProject = makeFakeProject({ appelOffreId, periodeId, classe: 'Classé' })
const { familleId, numeroCRE } = fakeProject

const fakeUser = OldUnwrapForTest(makeUser(makeFakeUser()))

const appelsOffres = appelsOffreStatic.reduce((map, appelOffre) => {
  map[appelOffre.id] = appelOffre
  return map
}, {})

const fakeHistory: StoredEvent[] = [
  new ProjectImported({
    payload: {
      projectId: projectId.toString(),
      periodeId,
      appelOffreId,
      familleId,
      numeroCRE,
      importedBy: fakeUser.id,
      data: fakeProject,
    },
    original: {
      occurredAt: new Date(123),
      version: 1,
    },
  }),
  new ProjectNotified({
    payload: {
      projectId: projectId.toString(),
      periodeId,
      appelOffreId,
      familleId,
      candidateEmail: 'test@test.com',
      candidateName: '',
      notifiedOn: 123,
    },
    original: {
      occurredAt: new Date(456),
      version: 1,
    },
  }),
]

describe('Project.shouldCertificateBeGenerated', () => {
  describe('when project is not notified', () => {
    it('should return false', () => {
      // Create a project that has not been notified
      const project = UnwrapForTest(
        makeProject({
          projectId,
          appelsOffres,
          history: fakeHistory.filter((event) => event.type !== ProjectNotified.type),
        })
      )

      expect(project.shouldCertificateBeGenerated).toBe(false)
    })
  })

  describe('when project is from a periode that has no certificate', () => {
    it('should return false', () => {
      // Create a project that has not been notified
      const project = UnwrapForTest(
        makeProject({
          projectId,
          appelsOffres,
          // Switch to Fessenheim periode 1 which does not have certificate
          history: fakeHistory.map((event: any) => ({
            ...event,
            payload: { ...event.payload, appelOffreId: 'Fessenheim', periodeId: '1' },
          })),
        })
      )

      expect(project.shouldCertificateBeGenerated).toBe(false)
    })
  })

  describe('when project is notified', () => {
    describe('when a certificate has been generated since last update', () => {
      const project = UnwrapForTest(
        makeProject({
          projectId,
          appelsOffres,
          history: fakeHistory.concat([
            new ProjectCertificateGenerated({
              payload: {
                projectId: projectId.toString(),
                projectVersionDate: new Date(456),
                certificateFileId: 'file1',
                candidateEmail: '',
                periodeId: '',
                appelOffreId: '',
              },
            }),
          ]),
        })
      )

      it('should return false', () => {
        expect(project.shouldCertificateBeGenerated).toBe(false)
      })
    })

    describe('when a certificate has been generated since last update but for a prior version', () => {
      const project = UnwrapForTest(
        makeProject({
          projectId,
          appelsOffres,
          history: fakeHistory.concat([
            new ProjectCertificateGenerated({
              payload: {
                projectId: projectId.toString(),
                projectVersionDate: new Date(123),
                certificateFileId: 'file1',
                candidateEmail: '',
                periodeId: '',
                appelOffreId: '',
              },
            }),
          ]),
        })
      )

      it('should return true', () => {
        expect(project.shouldCertificateBeGenerated).toBe(true)
      })
    })

    describe('when a certificate has been uploaded since last update', () => {
      const project = UnwrapForTest(
        makeProject({
          projectId,
          appelsOffres,
          history: fakeHistory.concat([
            new ProjectCertificateUploaded({
              payload: {
                projectId: projectId.toString(),
                certificateFileId: 'file1',
                uploadedBy: '',
              },
              original: {
                occurredAt: new Date(456),
                version: 1,
              },
            }),
          ]),
        })
      )

      it('should return false', () => {
        expect(project.shouldCertificateBeGenerated).toBe(false)
      })
    })

    describe('when no certificate has been uploaded or generated since last update', () => {
      const project = UnwrapForTest(makeProject({ projectId, history: fakeHistory, appelsOffres }))

      it('should return true', () => {
        expect(project.shouldCertificateBeGenerated).toBe(true)
      })
    })
  })
})
