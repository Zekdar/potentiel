import * as yup from 'yup'

const candidateNotificationSchema = yup.object({
  id: yup.string().notRequired(),
  projectId: yup.string().notRequired(),
  template: yup
    .mixed<'laureat' | 'elimination'>()
    .oneOf(['laureat', 'elimination']),
  data: yup
    .object()
    .nullable()
    .notRequired()
    .default({}),
  projectAdmissionKey: yup.string().required()
})

export type CandidateNotification = yup.InferType<
  typeof candidateNotificationSchema
>

export default function buildMakeCandidateNotification() {
  return function makeCandidateNotification(
    candidateNotification: any
  ): CandidateNotification {
    try {
      return candidateNotificationSchema.validateSync(candidateNotification, {
        stripUnknown: true
      })
    } catch (e) {
      throw e
    }
  }
}
