import React from 'react'

import { Project, CandidateNotification } from '../../entities'
import ROUTES from '../../routes'
import { dataId } from '../../helpers/testId'

interface Props {
  projects?: Array<Project>
  projectActions?: (
    project: Project
  ) => Array<{ title: string; link: string; disabled?: boolean }> | null
}

const ProjectList = ({ projects, projectActions }: Props) => {
  // console.log('ProjectList received', projects)

  if (!projects || !projects.length) {
    return (
      <table className="table">
        <tbody>
          <tr>
            <td>Il n'y a pas encore de projets en base</td>
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <>
      <table className="table" {...dataId('projectList-list')}>
        <thead>
          <tr>
            <th>Periode</th>
            <th>Projet</th>
            <th>Candidat</th>
            <th>Puissance</th>
            <th>Prix</th>
            <th>Evaluation Carbone</th>
            <th>Classé</th>
            {projectActions ? <th></th> : ''}
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={'project_' + project.id}>
              <td valign="top">
                <div {...dataId('projectList-item-periode')}>
                  {project.periode}
                </div>
                <div
                  style={{
                    fontStyle: 'italic',
                    lineHeight: 'normal',
                    fontSize: 12
                  }}
                  {...dataId('projectList-item-famille')}
                >
                  famille {project.famille}
                </div>
              </td>
              <td valign="top">
                <div {...dataId('projectList-item-nomProjet')}>
                  {project.nomProjet}
                </div>
                <div
                  style={{
                    fontStyle: 'italic',
                    lineHeight: 'normal',
                    fontSize: 12
                  }}
                >
                  <span {...dataId('projectList-item-communeProjet')}>
                    {project.communeProjet}
                  </span>
                  ,{' '}
                  <span {...dataId('projectList-item-departementProjet')}>
                    {project.departementProjet}
                  </span>
                  ,{' '}
                  <span {...dataId('projectList-item-regionProjet')}>
                    {project.regionProjet}
                  </span>
                </div>
              </td>
              <td valign="top">
                <div {...dataId('projectList-item-nomCandidat')}>
                  {project.nomCandidat}
                </div>
                <div
                  style={{
                    fontStyle: 'italic',
                    lineHeight: 'normal',
                    fontSize: 12
                  }}
                >
                  <span {...dataId('projectList-item-nomRepresentantLegal')}>
                    {project.nomRepresentantLegal}
                  </span>{' '}
                  <span {...dataId('projectList-item-email')}>
                    {project.email}
                  </span>
                </div>
              </td>
              <td valign="top">
                <span {...dataId('projectList-item-puissance')}>
                  {project.puissance}
                </span>{' '}
                <span
                  style={{
                    fontStyle: 'italic',
                    lineHeight: 'normal',
                    fontSize: 12
                  }}
                >
                  kWc
                </span>
              </td>
              <td valign="top">
                <span {...dataId('projectList-item-prixReference')}>
                  {project.prixReference}
                </span>{' '}
                <span
                  style={{
                    fontStyle: 'italic',
                    lineHeight: 'normal',
                    fontSize: 12
                  }}
                >
                  €/MWh
                </span>
              </td>
              <td valign="top">
                <span {...dataId('projectList-item-evaluationCarbone')}>
                  {project.evaluationCarbone}
                </span>{' '}
                <span
                  style={{
                    fontStyle: 'italic',
                    lineHeight: 'normal',
                    fontSize: 12
                  }}
                >
                  kg eq CO2/kWc
                </span>
              </td>
              <td
                valign="top"
                className={
                  'notification ' +
                  (project.classe === 'Classé' ? 'success' : 'error')
                }
              >
                <div {...dataId('projectList-item-classe')}>
                  {project.classe}
                </div>
                <div
                  style={{
                    fontStyle: 'italic',
                    lineHeight: 'normal',
                    fontSize: 12
                  }}
                  {...dataId('projectList-item-motifsElimination')}
                >
                  {project.motifsElimination || ''}
                </div>
              </td>
              {projectActions && projectActions(project) ? (
                <td style={{ position: 'relative' }}>
                  <img
                    src="/images/icons/external/more.svg"
                    height="12"
                    width="12"
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                    className="project-list--action-trigger"
                  />
                  <ul className="project-list--action-menu">
                    {projectActions(project)?.map(
                      ({ title, link, disabled }, actionIndex) => (
                        <li key={'notif_' + project.id + '_' + actionIndex}>
                          {disabled ? (
                            <i>{title}</i>
                          ) : (
                            <a
                              href={link}
                              {...dataId('projectList-item-action')}
                            >
                              {title}
                            </a>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                </td>
              ) : (
                ''
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <nav className="pagination">
        <div className="pagination__display-group">
          <label
            htmlFor="pagination__display"
            className="pagination__display-label"
          >
            Projets par page
          </label>
          <select className="pagination__display" id="pagination__display">
            <option>5</option>
            <option>10</option>
            <option>50</option>
            <option>100</option>
          </select>
        </div>
        <div className="pagination__count">
          <strong>{projects?.length}</strong> sur{' '}
          <strong>{projects?.length}</strong>
        </div>
        <ul className="pagination__pages" style={{ display: 'none' }}>
          <li className="disabled">
            <a>❮ Précédent</a>
          </li>
          <li className="active">
            <a>1</a>
          </li>
          <li>
            <a>2</a>
          </li>
          <li>
            <a>3</a>
          </li>
          <li>
            <a>4</a>
          </li>
          <li className="disabled">
            <a>5</a>
          </li>
          <li>
            <a>Suivant ❯</a>
          </li>
        </ul>
      </nav>
    </>
  )
}

export default ProjectList
