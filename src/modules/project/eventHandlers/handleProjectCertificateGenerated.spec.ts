import { okAsync } from 'neverthrow'
import { makeProject, ProjectAdmissionKey } from '../../../entities'
import { InMemoryEventStore } from '../../../infra/inMemory'
import { ErrorResult, Ok, UnwrapForTest } from '../../../types'
import makeFakeProject from '../../../__tests__/fixtures/project'
import { GetPeriodeTitle } from '../../appelOffre'
import { StoredEvent } from '../../eventStore'
import { NotificationArgs } from '../../notification'
import {
  CandidateNotificationForPeriodeFailed,
  CandidateNotifiedForPeriode,
  ProjectCertificateGenerated,
  ProjectCertificateGenerationFailed,
  ProjectNotified,
} from '../events'
import { handleProjectCertificateGenerated } from './'

describe('handleProjectCertificateGenerated', () => {
  const project = UnwrapForTest(
    makeProject(
      makeFakeProject({
        nomRepresentantLegal: 'representant1',
      })
    )
  )

  const findProjectById = jest.fn(async (args) => project)

  describe('when all projects for this periode and email have a ProjectCertificateGenerated (or failed)', () => {
    const eventStore = new InMemoryEventStore()

    const fakePayload = {
      periodeId: 'periode1',
      appelOffreId: 'appelOffre1',
      candidateEmail: 'email1@test.test',
      notifiedOn: 0,
    }

    let candidateNotifiedEvent: StoredEvent | undefined = undefined

    beforeAll(async (done) => {
      eventStore.subscribe(CandidateNotifiedForPeriode.type, (event) => {
        candidateNotifiedEvent = event
        done()
      })

      handleProjectCertificateGenerated(eventStore, { findProjectById })

      // Create two projects for the same candidateEmail
      eventStore.publish(
        new ProjectNotified({
          payload: { ...fakePayload, projectId: 'project1' },
          requestId: 'request1',
        })
      )
      eventStore.publish(
        new ProjectNotified({
          payload: { ...fakePayload, projectId: 'project2' },
          requestId: 'request1',
        })
      )
      // Create one project from another candidate email (which will have no project certificate but shouldn't prevent sending a notification)
      eventStore.publish(
        new ProjectNotified({
          payload: {
            ...fakePayload,
            projectId: 'project3',
            candidateEmail: 'otherCandidate',
          },
          requestId: 'request1',
        })
      )
      // project1 has a successfully generated certificate
      eventStore.publish(
        new ProjectCertificateGenerated({
          payload: {
            ...fakePayload,
            projectId: 'project1',
            certificateFileId: 'certificateFile1',
          },
          requestId: 'request1',
        })
      )
      // project2 has a failed certificate generation
      eventStore.publish(
        new ProjectCertificateGenerationFailed({
          payload: {
            ...fakePayload,
            projectId: 'project2',
            error: 'oops',
          },
          requestId: 'request1',
        })
      )
    })

    it('should trigger CandidateNotifiedForPeriode', () => {
      expect(candidateNotifiedEvent).toBeDefined()
      if (!candidateNotifiedEvent) return

      expect(candidateNotifiedEvent.type).toEqual(
        CandidateNotifiedForPeriode.type
      )
      expect(candidateNotifiedEvent.payload).toEqual({
        ...fakePayload,
        candidateName: 'representant1',
      })
      expect(candidateNotifiedEvent.requestId).toEqual('request1')
    })
  })

  describe('when some projects for this periode and email have no ProjectCertificateGenerated yet', () => {
    const eventStore = new InMemoryEventStore()

    const fakePayload = {
      periodeId: 'periode1',
      appelOffreId: 'appelOffre1',
      candidateEmail: 'email1@test.test',
      notifiedOn: 0,
    }

    const fakeCandidateNotifedForPeriodeHandler = jest.fn(
      (event: CandidateNotifiedForPeriode) => null
    )

    beforeAll(() => {
      eventStore.subscribe(
        CandidateNotifiedForPeriode.type,
        fakeCandidateNotifedForPeriodeHandler
      )

      handleProjectCertificateGenerated(eventStore, { findProjectById })

      // Create two projects for the same candidateEmail
      eventStore.publish(
        new ProjectNotified({
          payload: { ...fakePayload, projectId: 'project1' },
        })
      )
      eventStore.publish(
        new ProjectNotified({
          payload: { ...fakePayload, projectId: 'project2' },
        })
      )
      // project1 has a successfully generated certificate
      eventStore.publish(
        new ProjectCertificateGenerated({
          payload: {
            ...fakePayload,
            projectId: 'project1',
            certificateFileId: 'certificateFile1',
          },
        })
      )
      // project2 doesnt have a generated certificate yet
    })

    it('should not trigger CandidateNotifiedForPeriode', () => {
      expect(fakeCandidateNotifedForPeriodeHandler).not.toHaveBeenCalled()
    })
  })
})
