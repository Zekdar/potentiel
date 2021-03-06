import { ModificationRequestRepo } from '../dataAccess'
import { ModificationRequest } from '../entities'

interface MakeUseCaseProps {
  modificationRequestRepo: ModificationRequestRepo
}

export default function makeListAllRequests({ modificationRequestRepo }: MakeUseCaseProps) {
  return async function listAllRequests(): Promise<Array<ModificationRequest>> {
    return modificationRequestRepo.findAll({}, true)
  }
}
