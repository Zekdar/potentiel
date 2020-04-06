import AdminDashboard from '../components/adminDashboard'

import React from 'react'

import { Project, AppelOffre, Periode } from '../../entities'
import ROUTES from '../../routes'
import { dataId } from '../../helpers/testId'

import ProjectList from '../components/projectList'
import { HttpRequest } from '../../types'

interface AdminNotifyCandidatesProps {
  request: HttpRequest
  projects?: Array<Project>
  appelsOffre: Array<AppelOffre>
  selectedAppelOffreId: AppelOffre['id']
  selectedPeriodeId: Periode['id']
}

/* Pure component */
export default function AdminNotifyCandidates({
  request,
  projects,
  appelsOffre,
  selectedAppelOffreId,
  selectedPeriodeId
}: AdminNotifyCandidatesProps) {
  const { error, success } = request.query || {}
  return (
    <AdminDashboard currentPage="notify-candidates">
      <div className="panel">
        <div className="panel__header">
          <h3>Projets à notifier</h3>
          <input
            type="text"
            className="table__filter"
            placeholder="Filtrer les projets"
          />
        </div>
        <div className="form__group">
          <legend>AO et Période</legend>
          <select
            name="appelOffre"
            id="appelOffre"
            {...dataId('notifyCandidates-appelOffreField')}
          >
            {appelsOffre.map(appelOffre => (
              <option
                key={'appel_' + appelOffre.id}
                value={appelOffre.id}
                selected={appelOffre.id === selectedAppelOffreId}
              >
                {appelOffre.shortTitle}
              </option>
            ))}
          </select>
          <select
            name="periode"
            id="periode"
            {...dataId('notifyCandidates-periodeField')}
          >
            {appelsOffre
              .find(ao => ao.id === selectedAppelOffreId)
              ?.periodes.map(periode => (
                <option
                  key={'appel_' + periode.id}
                  value={periode.id}
                  selected={periode.id === selectedPeriodeId}
                >
                  {periode.title}
                </option>
              ))}
          </select>
        </div>
        {success ? (
          <div className="notification success" {...dataId('success-message')}>
            {success}
          </div>
        ) : (
          ''
        )}
        {error ? (
          <div className="notification error" {...dataId('error-message')}>
            {error}
          </div>
        ) : (
          ''
        )}
        <ProjectList
          projects={projects}
          projectActions={(project: Project) => [
            {
              title: "M'envoyer le mail de notification",
              link: '' // TODO
            },
            {
              title: 'Voir attestation',
              link: ROUTES.CANDIDATE_CERTIFICATE(project.id)
            }
          ]}
        />
      </div>
    </AdminDashboard>
  )
}
