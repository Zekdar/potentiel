import AdminDashboard from '../components/adminDashboard'

import React from 'react'

import { Project, AppelOffre, Periode, Famille } from '../../entities'
import ROUTES from '../../routes'
import { dataId } from '../../helpers/testId'
import { asLiteral } from '../../helpers/asLiteral'

import ProjectList from '../components/projectList'
import { adminActions } from '../components/actions'
import { HttpRequest, PaginatedList } from '../../types'

interface AdminListProjectsProps {
  request: HttpRequest
  projects: PaginatedList<Project> | Array<Project>
  appelsOffre: Array<AppelOffre>
}

/* Pure component */
export default function AdminListProjects({
  request,
  projects,
  appelsOffre,
}: AdminListProjectsProps) {
  const {
    error,
    success,
    recherche,
    appelOffreId,
    periodeId,
    familleId,
    garantiesFinancieres,
    classement,
  } = request.query || {}

  const hasFilters =
    appelOffreId || periodeId || familleId || garantiesFinancieres || classement
  return (
    <AdminDashboard role={request.user?.role} currentPage="list-projects">
      <div className="panel">
        <div className="panel__header">
          <h3>Projets</h3>
          <form
            action={ROUTES.ADMIN_LIST_PROJECTS}
            method="GET"
            style={{ maxWidth: 'auto', margin: '0 0 25px 0' }}
          >
            <div className="form__group" style={{ marginTop: 20 }}>
              <input
                type="text"
                name="recherche"
                {...dataId('recherche-field')}
                style={{ paddingRight: 40 }}
                defaultValue={recherche || ''}
              />
              <button
                className="overlay-button"
                style={{
                  right: 10,
                  top: 10,
                  width: 30,
                  height: 30,
                }}
                type="submit"
                {...dataId('submit-button')}
              >
                <svg
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="var(--grey)"
                  width="20"
                  height="20"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>

            <div className="form__group">
              <legend
                {...dataId('visibility-toggle')}
                className={'filter-toggle' + (hasFilters ? ' open' : '')}
              >
                Filtrer
                <svg className="icon filter-icon">
                  <use xlinkHref="#expand"></use>
                </svg>
              </legend>
              <div className="filter-panel">
                <div>
                  <div style={{ marginLeft: 2 }}>
                    Par appel d'offre, période et famille
                  </div>
                  <select
                    name="appelOffreId"
                    className={appelOffreId ? 'active' : ''}
                    {...dataId('appelOffreIdSelector')}
                  >
                    <option value="">Tous AO</option>
                    {appelsOffre.map((appelOffre) => (
                      <option
                        key={'appel_' + appelOffre.id}
                        value={appelOffre.id}
                        selected={appelOffre.id === appelOffreId}
                      >
                        {appelOffre.shortTitle}
                      </option>
                    ))}
                  </select>
                  <select
                    name="periodeId"
                    className={periodeId ? 'active' : ''}
                    {...dataId('periodeIdSelector')}
                  >
                    <option value="">Toutes périodes</option>
                    {appelsOffre
                      .find((ao) => ao.id === appelOffreId)
                      ?.periodes.map((periode) => (
                        <option
                          key={'appel_' + periode.id}
                          value={periode.id}
                          selected={periode.id === periodeId}
                        >
                          {periode.title}
                        </option>
                      ))}
                  </select>
                  <select
                    name="familleId"
                    className={familleId ? 'active' : ''}
                    {...dataId('familleIdSelector')}
                  >
                    <option value="">Toutes familles</option>
                    {appelsOffre
                      .find((ao) => ao.id === appelOffreId)
                      ?.familles.sort((a, b) => a.title.localeCompare(b.title))
                      .map((famille) => (
                        <option
                          key={'appel_' + famille.id}
                          value={famille.id}
                          selected={famille.id === familleId}
                        >
                          {famille.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div style={{ marginTop: 15 }}>
                  <div style={{ marginLeft: 2 }}>Garanties Financières</div>
                  <select
                    name="garantiesFinancieres"
                    className={garantiesFinancieres ? 'active' : ''}
                    {...dataId('garantiesFinancieresSelector')}
                  >
                    <option value="">Toutes</option>
                    <option
                      value="submitted"
                      selected={
                        garantiesFinancieres &&
                        garantiesFinancieres === 'submitted'
                      }
                    >
                      Déposées
                    </option>
                    <option
                      value="notSubmitted"
                      selected={
                        garantiesFinancieres &&
                        garantiesFinancieres === 'notSubmitted'
                      }
                    >
                      Non-déposées
                    </option>
                  </select>
                </div>
                <div style={{ marginTop: 15 }}>
                  <div style={{ marginLeft: 2 }}>Classés/Eliminés</div>
                  <select
                    name="classement"
                    className={classement ? 'active' : ''}
                    {...dataId('classementSelector')}
                  >
                    <option value="">Tous</option>
                    <option
                      value="classés"
                      selected={classement && classement === 'classés'}
                    >
                      Classés
                    </option>
                    <option
                      value="éliminés"
                      selected={classement && classement === 'éliminés'}
                    >
                      Eliminés
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </form>
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
        <div className="pagination__count">
          <strong>
            {Array.isArray(projects) ? projects.length : projects.itemCount}
          </strong>{' '}
          projets
        </div>
        <ProjectList
          displayColumns={[
            'Periode',
            'Projet',
            'Candidat',
            'Puissance',
            ...(request.user?.role === 'admin' ? ['Prix'] : []),
            'Evaluation Carbone',
            'Classé',
          ]}
          projects={projects}
          projectActions={
            request.user?.role === 'admin' ? adminActions : undefined
          }
        />
      </div>
    </AdminDashboard>
  )
}
