import React from 'react'

import { Project } from '../../entities'
import ROUTES from '../../routes'

import ProjectList from '../components/projectList'

interface UserDashboardProps {
  error?: string
  success?: string
  projects?: Array<Project>
}

/* Pure component */
export default function LoginPage({
  error,
  success,
  projects
}: UserDashboardProps) {
  return (
    <>
      <div className="hero" role="banner">
        <div className="hero__container" style={{ minHeight: '10em' }}>
          <h1>Portail Porteur de Projet</h1>
        </div>
      </div>
      <main role="main">
        <section className="section section-white">
          <div className="container">
            <div>
              <h3>Mes Projets</h3>
              <input
                type="text"
                className="table__filter"
                placeholder="Filtrer les projets"
              />
              <ProjectList
                projects={projects}
                projectActions={(project: Project) => {
                  if (project.classe === 'Eliminé') {
                    return [
                      {
                        title: 'Faire une demande de recours',
                        link: ROUTES.DEPOSER_RECOURS(project.id)
                      },
                      {
                        title: 'Télécharger mon attestation',
                        link: ROUTES.TELECHARGER_ATTESTATION(project.id),
                        disabled: true
                      }
                    ]
                  }

                  return [
                    {
                      title: 'Télécharger mon attestation',
                      link: ROUTES.TELECHARGER_ATTESTATION(project.id),
                      disabled: true
                    },
                    {
                      title: 'Demander un délais',
                      link: ROUTES.DEMANDE_DELAIS(project.id)
                    },
                    {
                      title: 'Changer de fournisseur',
                      link: ROUTES.CHANGER_FOURNISSEUR(project.id)
                    },
                    {
                      title: "Changer d'actionnaire",
                      link: ROUTES.CHANGER_ACTIONNAIRE(project.id)
                    },
                    {
                      title: 'Changer de puissance',
                      link: ROUTES.CHANGER_PUISSANCE(project.id)
                    },
                    {
                      title: 'Demande un abandon',
                      link: ROUTES.DEMANDER_ABANDON(project.id)
                    }
                  ]
                }}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
