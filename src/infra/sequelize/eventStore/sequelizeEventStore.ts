import { EventEmitter } from 'events'
import {
  okAsync,
  ResultAsync,
  ok,
  mapResults,
  Result,
} from '../../../core/utils'
import { DomainEvent } from '../../../core/domain'
import { v4 as uuid } from 'uuid'
import {
  BaseEventStore,
  EventStore,
  EventStoreHistoryFilters,
  EventStoreTransactionFn,
  StoredEvent,
} from '../../../modules/eventStore/EventStore'
import { InfraNotAvailableError, OtherError } from '../../../modules/shared'
import { Queue } from '../../../core/utils'
import {
  CandidateNotificationForPeriodeFailed,
  CandidateNotificationForPeriodeFailedPayload,
  CandidateNotifiedForPeriode,
  CandidateNotifiedForPeriodePayload,
  PeriodeNotified,
  PeriodeNotifiedPayload,
  ProjectCertificateGenerated,
  ProjectCertificateGeneratedPayload,
  ProjectCertificateGenerationFailed,
  ProjectCertificateGenerationFailedPayload,
  ProjectNotified,
  ProjectNotifiedPayload,
} from '../../../modules/project/events'

function isNotNullOrUndefined<T>(input: null | undefined | T): input is T {
  return input != null
}

export class SequelizeEventStore extends BaseEventStore {
  private EventStoreModel
  constructor(models) {
    super()
    this.EventStoreModel = models.EventStore
  }

  protected persistEvent(
    event: StoredEvent
  ): ResultAsync<null, InfraNotAvailableError> {
    return ResultAsync.fromPromise(
      this.EventStoreModel.create(this.toPersistance(event)),
      (e: any) => {
        console.log('SequelizeEventStore _persistEvent error', e.message)
        return new InfraNotAvailableError()
      }
    )
  }

  public loadHistory(
    filters?: EventStoreHistoryFilters
  ): ResultAsync<StoredEvent[], InfraNotAvailableError> {
    return ResultAsync.fromPromise(
      this.EventStoreModel.findAll(this.toQuery(filters)),
      (e: any) => {
        console.log('SequelizeEventStore _loadHistory error', e.message)
        return new InfraNotAvailableError()
      }
    )
      .map((events: any[]) => {
        const payload = filters?.payload
        // Do this in memory for now
        // TODO: create proper sequelize query for payload search
        return payload
          ? events
              .map((item) => item.get())
              .filter((event) =>
                Object.entries(payload).every(
                  ([key, value]) => event.payload[key] === value
                )
              )
          : events
      })
      .map((events: any[]) =>
        events.map(this.fromPersistance).filter(isNotNullOrUndefined)
      )
  }

  private toPersistance(event: StoredEvent) {
    return {
      id: uuid(),
      type: event.type,
      version: event.getVersion(),
      payload: event.payload,
      aggregateId: event.aggregateId,
      requestId: event.requestId,
      occurredAt: event.occurredAt,
    }
  }

  private fromPersistance(eventRaw: any): StoredEvent | null {
    switch (eventRaw.type) {
      case ProjectNotified.type:
        return new ProjectNotified({
          payload: eventRaw.payload as ProjectNotifiedPayload,
          requestId: eventRaw.requestId,
          aggregateId: eventRaw.aggregateId,
          original: {
            version: eventRaw.version,
            occurredAt: eventRaw.occurredAt,
          },
        })
      case ProjectCertificateGenerated.type:
        return new ProjectCertificateGenerated({
          payload: eventRaw.payload as ProjectCertificateGeneratedPayload,
          requestId: eventRaw.requestId,
          aggregateId: eventRaw.aggregateId,
          original: {
            version: eventRaw.version,
            occurredAt: eventRaw.occurredAt,
          },
        })
      case ProjectCertificateGenerationFailed.type:
        return new ProjectCertificateGenerationFailed({
          payload: eventRaw.payload as ProjectCertificateGenerationFailedPayload,
          requestId: eventRaw.requestId,
          aggregateId: eventRaw.aggregateId,
          original: {
            version: eventRaw.version,
            occurredAt: eventRaw.occurredAt,
          },
        })
      case PeriodeNotified.type:
        return new PeriodeNotified({
          payload: eventRaw.payload as PeriodeNotifiedPayload,
          requestId: eventRaw.requestId,
          aggregateId: eventRaw.aggregateId,
          original: {
            version: eventRaw.version,
            occurredAt: eventRaw.occurredAt,
          },
        })
      case CandidateNotificationForPeriodeFailed.type:
        return new CandidateNotificationForPeriodeFailed({
          payload: eventRaw.payload as CandidateNotificationForPeriodeFailedPayload,
          requestId: eventRaw.requestId,
          aggregateId: eventRaw.aggregateId,
          original: {
            version: eventRaw.version,
            occurredAt: eventRaw.occurredAt,
          },
        })
      case CandidateNotifiedForPeriode.type:
        return new CandidateNotifiedForPeriode({
          payload: eventRaw.payload as CandidateNotifiedForPeriodePayload,
          requestId: eventRaw.requestId,
          aggregateId: eventRaw.aggregateId,
          original: {
            version: eventRaw.version,
            occurredAt: eventRaw.occurredAt,
          },
        })
      default:
        return null
    }
  }

  private toQuery(filters?: EventStoreHistoryFilters) {
    const query: any = {}

    if (filters?.eventType) {
      query.type = filters.eventType
    }

    if (filters?.requestId) {
      query.requestId = filters.requestId
    }

    if (filters?.aggregateId) {
      query.aggregateId = filters.aggregateId
    }

    // console.log('toQuery query is', query)

    return {
      where: query,
    }
  }
}