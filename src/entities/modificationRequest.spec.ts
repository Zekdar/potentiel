import { makeModificationRequest } from './'

describe('ModificationRequest entity', () => {
  it("should accept an 'actionnaire' request with actionnaire and filePath", () => {
    const modificationRequestResult = makeModificationRequest({
      userId: '1',
      projectId: '1',
      type: 'actionnaire',
      actionnaire: 'nouvel actionnaire',
      filePath: 'filePath'
    } as any)

    expect(modificationRequestResult.is_ok()).toBeTruthy()
  })

  it("should refuse a 'actionnaire' request that is missing filePath", () => {
    const modificationRequestResult = makeModificationRequest({
      userId: '1',
      projectId: '1',
      type: 'actionnaire',
      actionnaire: 'nouvel actionnaire'
      // filePath: 'filePath'
    } as any)

    expect(modificationRequestResult.is_err()).toBeTruthy()
  })

  it("should refuse a 'actionnaire' request that is missing actionnaire", () => {
    const modificationRequestResult = makeModificationRequest({
      userId: '1',
      projectId: '1',
      type: 'actionnaire',
      // actionnaire: 'nouvel actionnaire'
      filePath: 'filePath'
    } as any)

    expect(modificationRequestResult.is_err()).toBeTruthy()
  })

  it("should accept an 'producteur' request with producteur and filePath", () => {
    const modificationRequestResult = makeModificationRequest({
      userId: '1',
      projectId: '1',
      type: 'producteur',
      producteur: 'nouveau producteur',
      filePath: 'filePath'
    } as any)

    expect(modificationRequestResult.is_ok()).toBeTruthy()
  })

  it("should refuse a 'producteur' request that is missing filePath", () => {
    const modificationRequestResult = makeModificationRequest({
      userId: '1',
      projectId: '1',
      type: 'producteur',
      producteur: 'nouvel producteur'
      // filePath: 'filePath'
    } as any)

    expect(modificationRequestResult.is_err()).toBeTruthy()
  })

  it("should refuse a 'producteur' request that is missing producteur", () => {
    const modificationRequestResult = makeModificationRequest({
      userId: '1',
      projectId: '1',
      type: 'producteur',
      // producteur: 'nouvel producteur'
      filePath: 'filePath'
    } as any)

    expect(modificationRequestResult.is_err()).toBeTruthy()
  })

  it("should accept an 'fournisseur' request with fournisseur, evaluationCarbone and filePath", () => {
    const modificationRequestResult = makeModificationRequest({
      userId: '1',
      projectId: '1',
      type: 'fournisseur',
      fournisseur: 'nouveau fournisseur',
      filePath: 'filePath',
      evaluationCarbone: 10
    } as any)

    expect(modificationRequestResult.is_ok()).toBeTruthy()
  })

  it("should refuse a 'fournisseur' request that is missing filePath", () => {
    const modificationRequestResult = makeModificationRequest({
      userId: '1',
      projectId: '1',
      type: 'fournisseur',
      fournisseur: 'nouvel fournisseur',
      evaluationCarbone: 10
      // filePath: 'filePath'
    } as any)

    expect(modificationRequestResult.is_err()).toBeTruthy()
  })

  it("should refuse a 'fournisseur' request that is missing fournisseur", () => {
    const modificationRequestResult = makeModificationRequest({
      userId: '1',
      projectId: '1',
      type: 'fournisseur',
      // fournisseur: 'nouvel fournisseur'
      filePath: 'filePath',
      evaluationCarbone: 10
    } as any)

    expect(modificationRequestResult.is_err()).toBeTruthy()
  })

  it("should refuse a 'fournisseur' request that is missing evaluationCarbone", () => {
    const modificationRequestResult = makeModificationRequest({
      userId: '1',
      projectId: '1',
      type: 'fournisseur',
      fournisseur: 'nouvel fournisseur',
      filePath: 'filePath'
      // evaluationCarbone: 10
    } as any)

    expect(modificationRequestResult.is_err()).toBeTruthy()
  })
})
