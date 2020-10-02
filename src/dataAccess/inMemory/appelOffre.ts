import { AppelOffre, Famille, Periode } from '../../entities'
import { asLiteral } from '../../helpers/asLiteral'
import _ from 'lodash'
import { ValuesType } from 'utility-types'

import {
  fessenheim,
  batiment,
  sol,
  innovation,
  zni,
  autoconsommationMetropole,
  autoconsommationZNI,
} from './appelsOffres'
import { errAsync, okAsync } from '../../core/utils'
import { EntityNotFoundError } from '../../modules/shared'
import { GetPeriodeTitle, GetFamille } from '../../modules/appelOffre'

const appelsOffreStatic = [
  batiment,
  fessenheim,
  sol,
  innovation,
  zni,
  autoconsommationMetropole,
  autoconsommationZNI,
]

const appelOffreRepo = {
  findAll: async () => {
    return appelsOffreStatic
  },
  findById: async (id: AppelOffre['id']) => {
    return _.cloneDeep(appelsOffreStatic.find((ao) => ao.id === id))
  },
  getFamille: ((appelOffreId: AppelOffre['id'], familleId: Famille['id']) => {
    const appelOffre = appelsOffreStatic.find((ao) => ao.id === appelOffreId)

    if (!appelOffre) return errAsync(new EntityNotFoundError())

    const famille = appelOffre.familles.find(
      (famille) => famille.id === familleId
    )

    if (!famille) return errAsync(new EntityNotFoundError())

    return okAsync(famille)
  }) as GetFamille,
  getPeriodeTitle: ((
    appelOffreId: AppelOffre['id'],
    periodeId: Periode['id']
  ) => {
    const appelOffre = appelsOffreStatic.find((ao) => ao.id === appelOffreId)

    if (!appelOffre) return errAsync(new EntityNotFoundError())

    const periode = appelOffre.periodes.find(
      (periode) => periode.id === periodeId
    )

    if (!periode) return errAsync(new EntityNotFoundError())

    return okAsync({
      periodeTitle: periode.title,
      appelOffreTitle: appelOffre.shortTitle,
    })
  }) as GetPeriodeTitle,
}

export { appelOffreRepo, appelsOffreStatic }
