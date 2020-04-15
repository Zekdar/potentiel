import React from 'react'

import { Project, AppelOffre } from '../../entities'
import ROUTES from '../../routes'

import ProjectList from '../components/projectList'
import UserDashboard from '../components/userDashboard'
import { HttpRequest } from '../../types'
import { dataId } from '../../helpers/testId'

interface UserListProjectsProps {
  request: HttpRequest
  projects?: Array<Project>
}

/* Pure component */
export default function UserListProjects({
  request,
  projects,
}: UserListProjectsProps) {
  const { error, success } = request.query || {}
  return (
    <UserDashboard currentPage="list-projects">
      <div className="panel">
        <div className="panel__header">
          <h3>Mes projets</h3>
          {/* <input
            type="text"
            className="table__filter"
            placeholder="Filtrer les projets"
          /> */}
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
          projectActions={(project: Project, appelOffre?: AppelOffre) => {
            if (project.classe === 'Eliminé') {
              return [
                {
                  title: 'Télécharger mon attestation',
                  link: ROUTES.CANDIDATE_CERTIFICATE_FOR_CANDIDATES(
                    project,
                    appelOffre
                  ),
                  isDownload: true,
                },
                {
                  title: 'Faire une demande de recours',
                  link: ROUTES.DEPOSER_RECOURS(project.id),
                },
              ]
            }

            return [
              {
                title: 'Télécharger mon attestation',
                link: ROUTES.CANDIDATE_CERTIFICATE_FOR_CANDIDATES(
                  project,
                  appelOffre
                ),
                isDownload: true,
              },
              {
                title: 'Demander un délai',
                link: ROUTES.DEMANDE_DELAIS(project.id),
              },
              // {
              //   title: 'Changer de fournisseur',
              //   link: ROUTES.CHANGER_FOURNISSEUR(project.id),
              // },
              {
                title: 'Changer de producteur',
                link: ROUTES.CHANGER_PRODUCTEUR(project.id),
              },
              {
                title: "Changer d'actionnaire",
                link: ROUTES.CHANGER_ACTIONNAIRE(project.id),
              },
              {
                title: 'Changer de puissance',
                link: ROUTES.CHANGER_PUISSANCE(project.id),
              },
              {
                title: 'Demander un abandon',
                link: ROUTES.DEMANDER_ABANDON(project.id),
              },
            ]
          }}
        />
      </div>
    </UserDashboard>
  )
}
