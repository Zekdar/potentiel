import { addDCR } from '../useCases'
import { Redirect, SystemError } from '../helpers/responses'
import { makeProjectFilePath } from '../helpers/makeProjectFilePath'
import { Controller, HttpRequest } from '../types'
import ROUTES from '../routes'
import _ from 'lodash'
import moment from 'moment'

import fs from 'fs'
import util from 'util'
import path from 'path'
const moveFile = util.promisify(fs.rename)
const dirExists = util.promisify(fs.exists)
const makeDir = util.promisify(fs.mkdir)
const makeDirIfNecessary = async (dirpath) => {
  const exists = await dirExists(dirpath)
  if (!exists) await makeDir(dirpath)

  return dirpath
}
const deleteFile = util.promisify(fs.unlink)

const postDCR = async (request: HttpRequest) => {
  // console.log(
  //   'Call to postDCR received',
  //   request.body,
  //   request.file
  // )

  if (!request.user) {
    return SystemError('User must be logged in')
  }

  const data = _.pick(request.body, ['dcrDate', 'projectId', 'numeroDossier'])
  const { projectId } = data

  if (!data.dcrDate) {
    return Redirect(ROUTES.PROJECT_DETAILS(projectId), {
      error:
        "Votre demande de raccordement n'a pas pu être transmise. La date d'attestation est obligatoire",
    })
  }

  // Convert date
  try {
    if (data.dcrDate) {
      const date = moment(data.dcrDate, 'DD/MM/YYYY')
      if (!date.isValid()) throw 'invalid date format'
      data.date = date.toDate().getTime()
    }
  } catch (error) {
    return Redirect(ROUTES.PROJECT_DETAILS(projectId), {
      error:
        "Votre demande de raccordement n'a pas pu être transmise. La date envoyée n'est pas au bon format (JJ/MM/AAAA)",
    })
  }

  // If there is a file, move it to a proper location
  const { filename, filepath } = request.file
    ? makeProjectFilePath(data.projectId, request.file.originalname)
    : { filename: undefined, filepath: undefined }
  if (request.file && filepath) {
    try {
      await makeDirIfNecessary(path.dirname(filepath))
      await moveFile(request.file.path, filepath)
      // console.log('File moved to ', filepath)
    } catch (error) {
      console.log('Could not move file')
    }
  }

  if (!filename) {
    return Redirect(ROUTES.PROJECT_DETAILS(projectId), {
      error:
        "Votre demande de raccordement n'a pas pu être transmise. Merci de joindre l'attestation en pièce-jointe.",
    })
  }

  const result = await addDCR({
    ...data,
    filename,
    user: request.user,
  })

  if (result.is_err() && filepath) {
    console.log('addDCR failed, removing file')
    await deleteFile(filepath)
  }

  return result.match({
    ok: () =>
      Redirect(ROUTES.PROJECT_DETAILS(projectId), {
        success: 'Votre demande de raccordement a bien été enregistrée.',
      }),
    err: (e: Error) => {
      console.log('postDCR error', e)
      return Redirect(ROUTES.PROJECT_DETAILS(projectId), {
        ..._.omit(data, 'projectId'),
        error: "Votre demande n'a pas pu être prise en compte: " + e.message,
      })
    },
  })
}

export { postDCR }
