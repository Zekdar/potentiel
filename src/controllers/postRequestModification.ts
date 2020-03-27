import { requestModification } from '../useCases'
import { Redirect, SystemError } from '../helpers/responses'
import { Controller, HttpRequest } from '../types'
import ROUTES from '../routes'
import _ from 'lodash'

import fs from 'fs'
import util from 'util'
import path from 'path'
const moveFile = util.promisify(fs.rename)
const dirExists = util.promisify(fs.exists)
const makeDir = util.promisify(fs.mkdir)
const makeDirIfNecessary = async dirpath => {
  const exists = await dirExists(dirpath)
  if (!exists) await makeDir(dirpath)

  return dirpath
}
const deleteFile = util.promisify(fs.unlink)

const postRequestModification = async (request: HttpRequest) => {
  // console.log('Call to postRequestModification received', request.body, request.file)

  console.log(
    'Call to postRequestModification received',
    request.body,
    request.file
  )

  if (!request.user) {
    return SystemError('User must be logged in')
  }

  const data = _.pick(request.body, [
    'type',
    'actionnaire',
    'producteur',
    'fournisseur',
    'puissance',
    'justification',
    'projectId'
  ])

  // TODO If there is a fiel, move it to a proper location
  let filePath
  if (request.file) {
    try {
      const projectDir = await makeDirIfNecessary(
        path.join(path.dirname(request.file.path), data.projectId)
      )
      filePath = path.join(projectDir, request.file.originalname)
      await moveFile(request.file.path, filePath)
    } catch (error) {
      console.log('Could not move file to', filePath)
      filePath = undefined
    }
  }

  // TODO If everything fails, remove the file

  const result = await requestModification({
    ...data,
    filePath,
    userId: request.user.id
  })

  if (result.is_err() && filePath) {
    console.log('requestModification failed, removing file')
    await deleteFile(filePath)
  }

  return result.match({
    ok: () =>
      Redirect(ROUTES.USER_LIST_DEMANDES, {
        success: 'Votre demande a bien été prise en compte.'
      }),
    err: (e: Error) => {
      console.log('postRequestModification error', e)
      const { projectId, type } = data
      let returnRoute
      switch (type) {
        case 'delai':
          returnRoute = ROUTES.DEMANDE_DELAIS(projectId)
          break
        case 'fournisseur':
          returnRoute = ROUTES.CHANGER_FOURNISSEUR(projectId)
          break
        case 'actionnaire':
          returnRoute = ROUTES.CHANGER_ACTIONNAIRE(projectId)
          break
        case 'puissance':
          returnRoute = ROUTES.CHANGER_PUISSANCE(projectId)
          break
        case 'producteur':
          returnRoute = ROUTES.CHANGER_PRODUCTEUR(projectId)
          break
        case 'abandon':
          returnRoute = ROUTES.DEMANDER_ABANDON(projectId)
          break
        default:
          returnRoute = ROUTES.USER_LIST_PROJECTS
          break
      }
      return Redirect(returnRoute, {
        error: "Votre demande n'a pas pu être prise en compte: " + e.message
      })
    }
  })
}

export { postRequestModification }
