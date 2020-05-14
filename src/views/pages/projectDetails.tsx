import React from 'react'
import moment from 'moment'

import { Project, User } from '../../entities'
import UserDashboard from '../components/userDashboard'
import AdminDashboard from '../components/adminDashboard'
import ProjectActions from '../components/projectActions'
import { porteurProjetActions, adminActions } from '../components/actions'
import { HttpRequest } from '../../types'
import { dataId } from '../../helpers/testId'
import ROUTES from '../../routes'

interface FriseContainerProps {
  children: React.ReactNode
  displayToggle: boolean
}

const Frise = ({ children, displayToggle }: FriseContainerProps) => (
  <table
    className="frise"
    style={{ borderCollapse: 'collapse', marginBottom: 20 }}
  >
    <thead>
      <tr>
        <td style={{ width: 16 }} />
        <td style={{ width: 16 }} />
        <td />
        <td />
        <td />
      </tr>
    </thead>
    <tbody>
      <tr>
        <td
          style={{
            position: 'relative',
            borderRight: '2px solid var(--dark-grey)',
            height: 10,
          }}
        ></td>
        <td></td>
      </tr>
      {children}
      {displayToggle ? (
        <tr>
          <td
            style={{
              position: 'relative',
              borderRight: '2px solid var(--dark-grey)',
            }}
          ></td>
          <td></td>
          <td colSpan={3} style={{ paddingLeft: 5 }}>
            <a
              className="frise--toggle-show"
              href="#"
              {...dataId('frise-show-timeline')}
            >
              Afficher les étapes suivantes
            </a>
            <a
              className="frise--toggle-hide"
              href="#"
              {...dataId('frise-hide-timeline')}
            >
              Masquer les étapes à venir
            </a>
          </td>
        </tr>
      ) : (
        ''
      )}
    </tbody>
  </table>
)

interface FriseItemProps {
  color?: string
  date?: string
  title: string
  action?: { title: string; link?: string }
  defaultHidden?: boolean
  isNextUp?: boolean
}
const FriseItem = ({
  color,
  defaultHidden,
  date,
  title,
  action,
  isNextUp,
}: FriseItemProps) => {
  return (
    <tr className={'frise--item' + (defaultHidden ? ' frise--collapsed' : '')}>
      <td
        style={{
          position: 'relative',
          borderRight: '2px solid var(--dark-grey)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 100 100"
          style={{ position: 'absolute', top: 0 }}
        >
          <circle
            fill={isNextUp ? 'var(--blue)' : color || '#8393a7'}
            cx="50%"
            cy="50%"
            r={isNextUp ? '24' : '20'}
          />
        </svg>
      </td>
      <td></td>
      <td style={{ padding: '0 5px', fontStyle: 'italic' }}>{date || ''}</td>
      <td style={{ padding: '0 5px' }}>{title}</td>
      <td>
        {action ? (
          action.link ? (
            <a href={action.link}>{action.title}</a>
          ) : (
            <span className="disabled-action">{action.title}</span>
          )
        ) : (
          ''
        )}
      </td>
    </tr>
  )
}

interface SectionProps {
  title: string
  defaultOpen?: boolean
  icon?: string
  children: React.ReactNode
}

const Section = ({ title, defaultOpen, children, icon }: SectionProps) => {
  return (
    <div {...dataId('projectDetails-section')}>
      <h3
        className={'section--title' + (defaultOpen ? ' open' : '')}
        {...dataId('projectDetails-section-toggle')}
      >
        {icon ? (
          <svg className="icon section-icon">
            <use xlinkHref={'#' + icon}></use>
          </svg>
        ) : (
          ''
        )}
        {title}
        <svg className="icon section--expand">
          <use xlinkHref="#expand"></use>
        </svg>
      </h3>
      <div
        className="section--content"
        {...dataId('projectDetails-section-content')}
      >
        {children}
      </div>
    </div>
  )
}

interface ProjectDetailsProps {
  request: HttpRequest
  project: Project
  projectUsers: Array<User>
  projectInvitations: Array<{ email: string }>
}

/* Pure component */
export default function ProjectDetails({
  request,
  project,
  projectUsers,
  projectInvitations,
}: ProjectDetailsProps) {
  const { user } = request
  const { error, success } = request.query || {}

  if (!user) {
    // Should never happen
    console.log('Try to render ProjectDetails without a user')
    return <div />
  }

  const Dashboard =
    user.role === 'porteur-projet' ? UserDashboard : AdminDashboard
  return (
    <Dashboard currentPage="list-projects">
      <div className="panel" style={{ padding: 0 }}>
        <div
          className="panel__header"
          style={{
            position: 'relative',
            padding: '1.5em',
            paddingBottom: 0,
            backgroundColor:
              project.classe === 'Classé'
                ? '#daf5e7'
                : 'hsla(5,70%,79%,.45882)',
          }}
        >
          <h3>{project.nomProjet}</h3>
          <span style={{ marginLeft: 10 }}>
            {project.communeProjet}, {project.departementProjet},{' '}
            {project.regionProjet}
          </span>
          <div style={{ fontSize: 13 }}>
            {project.appelOffre?.id} {project.appelOffre?.periode?.title}{' '}
            période
          </div>
          <div
            style={{
              fontWeight: 'bold',
              color:
                project.classe === 'Classé'
                  ? 'rgb(56, 118, 29)'
                  : 'rgb(204, 0, 0)',
            }}
          >
            {project.classe === 'Classé' ? 'Actif' : 'Eliminé'}
          </div>
          <div style={{ position: 'absolute', right: '1.5em', bottom: 25 }}>
            <ProjectActions
              project={project}
              projectActions={
                user.role === 'porteur-projet'
                  ? porteurProjetActions
                  : adminActions
              }
            />
          </div>
        </div>
        <div style={{ padding: '1.5em', paddingTop: 0 }}>
          {success ? (
            <div
              className="notification success"
              {...dataId('success-message')}
            >
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
          <div style={{ position: 'relative' }}>
            <Frise displayToggle={project.classe === 'Classé'}>
              {project.notifiedOn ? (
                <>
                  <FriseItem
                    color="var(--darkest-grey)"
                    date={moment(project.notifiedOn).format('D MMM YYYY')}
                    title="Notification des résultats"
                    action={
                      project.appelOffre?.periode?.canGenerateCertificate
                        ? {
                            title: "Télécharger l'attestation",
                            link:
                              user.role === 'porteur-projet'
                                ? ROUTES.CANDIDATE_CERTIFICATE_FOR_CANDIDATES(
                                    project
                                  )
                                : ROUTES.CANDIDATE_CERTIFICATE_FOR_ADMINS(
                                    project
                                  ),
                          }
                        : undefined
                    }
                  />
                  {project.classe === 'Classé' ? (
                    <>
                      <FriseItem
                        date={moment(project.notifiedOn)
                          .add(2, 'months')
                          .format('D MMM YYYY')}
                        title="Constitution des garanties financières"
                        action={{
                          title:
                            "Transmettre l'attestation (bientôt disponible)",
                        }}
                        isNextUp
                      />
                      <FriseItem
                        date={moment(project.notifiedOn)
                          .add(2, 'months')
                          .format('D MMM YYYY')}
                        title="Demande complète de raccordement"
                        action={{
                          title:
                            'Indiquer la date de demande (bientôt disponible)',
                        }}
                      />
                      <FriseItem
                        title="Proposition technique et financière"
                        action={{ title: 'Indiquer la date de signature' }}
                        defaultHidden={true}
                      />
                      <FriseItem
                        title="Convention de raccordement"
                        action={{ title: 'Indiquer la date de signature' }}
                        defaultHidden={true}
                      />
                      <FriseItem
                        date={moment(project.notifiedOn)
                          .add(
                            project.appelOffre?.delaiRealisationEnMois,
                            'months'
                          )
                          .format('D MMM YYYY')}
                        title="Attestation de conformité"
                        action={{ title: "Transmettre l'attestation" }}
                        defaultHidden={true}
                      />
                      <FriseItem
                        title="Mise en service"
                        action={{ title: 'Indiquer la date' }}
                        defaultHidden={true}
                      />
                      <FriseItem
                        title="Contrat d'achat"
                        action={{ title: 'Indiquer la date de signature' }}
                        defaultHidden={true}
                      />
                    </>
                  ) : (
                    ''
                  )}
                </>
              ) : (
                ''
              )}
            </Frise>
          </div>
          <Section title="Projet" icon="building">
            <div>
              <h5 style={{ marginBottom: 5 }}>Performances</h5>
              <div>
                Puissance installée: {project.puissance}{' '}
                {project.appelOffre?.unitePuissance}
              </div>
            </div>
            <div>
              <h5 style={{ marginBottom: 5, marginTop: 10 }}>
                Site de production
              </h5>
              <div>{project.adresseProjet}</div>
              <div>
                {project.codePostalProjet} {project.communeProjet}
              </div>
              <div>
                {project.departementProjet}, {project.regionProjet}
              </div>
            </div>
          </Section>
          <Section title="Contact" icon="user-circle">
            <div style={{ marginBottom: 10 }}>{project.nomCandidat}</div>
            <div>
              <h5 style={{ marginBottom: 5 }}>Représentant légal</h5>
              <div>{project.nomRepresentantLegal}</div>
              <div>{project.email}</div>
            </div>
            <div>
              <h5 style={{ marginBottom: 5, marginTop: 15 }}>
                Comptes ayant accès à ce projet
              </h5>
              <ul style={{ marginTop: 5, marginBottom: 5 }}>
                {projectUsers.map((user) => (
                  <li key={'project_user_' + user.id}>
                    {user.fullName} - {user.email}
                  </li>
                ))}
                {projectInvitations.map(({ email }) => (
                  <li key={'project_invitation_' + email}>
                    {email} (<i>invitation envoyée</i>)
                  </li>
                ))}
              </ul>
            </div>
            <div {...dataId('invitation-form')}>
              <a
                href="#"
                {...dataId('invitation-form-show-button')}
                className="invitationFormToggle"
              >
                Donner accès à un autre utilisateur
              </a>
              <form
                action={ROUTES.INVITE_USER_TO_PROJECT_ACTION}
                method="post"
                name="form"
                className="invitationForm"
              >
                <h5 style={{ marginBottom: 5 }}>
                  Gestion des accès à ce projet
                </h5>
                <input
                  type="hidden"
                  name="projectId"
                  id="projectId"
                  value={project.id}
                />
                <label htmlFor="email">
                  Courrier électronique de la personne habilitée à suivre ce
                  projet
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  {...dataId('email-field')}
                />
                <button
                  className="button"
                  type="submit"
                  name="submit"
                  id="submit"
                  {...dataId('submit-button')}
                >
                  Accorder les droits sur ce projet
                </button>
                <a href="#" {...dataId('invitation-form-hide-button')}>
                  Annuler
                </a>
              </form>
            </div>
          </Section>
          <Section title="Matériels et technologies" icon="cog">
            <div>Fournisseur: {project.fournisseur}</div>
            <div>
              Evaluation carbone simplifiée: {project.evaluationCarbone} kg eq
              CO2/kWc
            </div>
          </Section>
        </div>
      </div>
    </Dashboard>
  )
}
