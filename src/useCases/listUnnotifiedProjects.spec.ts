import makeListUnnotifiedProjects from './listUnnotifiedProjects'

import makeFakeProject from '../__tests__/fixtures/project'

import { projectRepo } from '../dataAccess/inMemory'
import { makeProject } from '../entities'

const listUnnotifiedProjects = makeListUnnotifiedProjects({ projectRepo })

describe('listUnnotifiedProjects use-case', () => {
  const appelOffreId = '1'
  const periodeId = '2'
  const fakeProjects = [
    makeFakeProject({ appelOffreId, periodeId, notifiedOn: 123 }), // already notified
    makeFakeProject({ appelOffreId, periodeId: 'other', notifiedOn: 0 }), // Wrong periode
    makeFakeProject({ appelOffreId: 'other', periodeId, notifiedOn: 0 }), // Wrong AppelOffre
    makeFakeProject({ appelOffreId, periodeId, notifiedOn: 0 }) // Good
  ]

  beforeAll(async () => {
    await Promise.all(
      fakeProjects
        .map(makeProject)
        .filter(item => item.is_ok())
        .map(item => item.unwrap())
        .map(projectRepo.insert)
    )
  })

  it('should return all unnotified projects for an AO and a Periode', async () => {
    const foundProjects = await listUnnotifiedProjects({
      appelOffreId,
      periodeId
    })

    expect(foundProjects).toHaveLength(1)
    expect(foundProjects[0].notifiedOn).toEqual(0)
    expect(foundProjects[0].appelOffreId).toEqual(appelOffreId)
    expect(foundProjects[0].periodeId).toEqual(periodeId)
  })
})
