import { makeModificationRequest, User, Project } from '../entities'
import { ModificationRequestRepo } from '../dataAccess'
import { FileService, File, FileContainer } from '../modules/file'
import { Err, Ok, ResultAsync, ErrorResult } from '../types'
import { makeProjectFilePath } from '../helpers/makeProjectFilePath'

interface MakeUseCaseProps {
  fileService: FileService
  modificationRequestRepo: ModificationRequestRepo
  shouldUserAccessProject: (args: { user: User; projectId: Project['id'] }) => Promise<boolean>
}

interface RequestCommon {
  user: User
  file?: FileContainer
  projectId: Project['id']
}

interface ActionnaireRequest {
  type: 'actionnaire'
  actionnaire: string
}

interface ProducteurRequest {
  type: 'producteur'
  producteur: string
}

interface FournisseurRequest {
  type: 'fournisseur'
  fournisseur: string
  evaluationCarbone: number
}

interface PuissanceRequest {
  type: 'puissance'
  puissance: number
}

interface DelayRequest {
  type: 'delai'
  justification: string
}

interface AbandonRequest {
  type: 'abandon'
  justification: string
}

interface RecoursRequest {
  type: 'recours'
  justification: string
}

type CallUseCaseProps = RequestCommon &
  (
    | ActionnaireRequest
    | ProducteurRequest
    | FournisseurRequest
    | PuissanceRequest
    | DelayRequest
    | AbandonRequest
    | RecoursRequest
  )

export const ERREUR_FORMAT = 'Merci de remplir les champs marqués obligatoires'
export const ACCESS_DENIED_ERROR = "Vous n'avez pas le droit de faire de demandes pour ce projet"
export const SYSTEM_ERROR =
  'Une erreur système est survenue, merci de réessayer ou de contacter un administrateur si le problème persiste.'

export default function makeRequestModification({
  fileService,
  modificationRequestRepo,
  shouldUserAccessProject,
}: MakeUseCaseProps) {
  return async function requestModification(props: CallUseCaseProps): ResultAsync<null> {
    const { user, projectId, file } = props

    // Check if the user has the rights to this project
    const access =
      user.role === 'porteur-projet' &&
      (await shouldUserAccessProject({
        user,
        projectId,
      }))

    if (!access) {
      return ErrorResult(ACCESS_DENIED_ERROR)
    }

    let fileId: string | undefined

    if (file) {
      const fileResult = File.create({
        designation: 'modification-request',
        forProject: projectId,
        createdBy: user.id,
        filename: file.path,
      })

      if (fileResult.isErr()) {
        console.log('requestModification use-case: File.create failed', fileResult.error)

        return ErrorResult(SYSTEM_ERROR)
      }

      const saveFileResult = await fileService.save(fileResult.value, {
        ...file,
        path: makeProjectFilePath(projectId, file.path).filepath,
      })

      if (saveFileResult.isErr()) {
        // OOPS
        console.log('requestModification use-case: fileService.save failed', saveFileResult.error)

        return ErrorResult(SYSTEM_ERROR)
      }

      fileId = fileResult.value.id.toString()
    }

    const modificationRequestResult = makeModificationRequest({
      ...props,
      fileId,
      userId: user.id,
    })

    if (modificationRequestResult.is_err()) {
      console.log(
        'requestModification use-case could not create modificationRequest',
        props,
        modificationRequestResult.unwrap_err()
      )
      return ErrorResult(ERREUR_FORMAT)
    }

    const modificationRequest = modificationRequestResult.unwrap()
    const insertionResult = await modificationRequestRepo.insert(modificationRequest)

    if (insertionResult.is_err()) {
      console.log(
        'requestModification use-case could not insert modificationRequest',
        modificationRequest,
        insertionResult.unwrap_err()
      )
      return Err(insertionResult.unwrap_err())
    }

    // All is good

    return Ok(null)
  }
}
