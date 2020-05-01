import React from 'react'

import { dataId } from '../../helpers/testId'
import { HttpRequest } from '../../types'
import routes from '../../routes'

interface Props {
  request: HttpRequest
}

/* Pure component */
export default function ForgottenPasswordPage({ request }: Props) {
  const { error, success } = request.query || {}
  return (
    <main role="main">
      <section className="section section-grey">
        <div className="container">
          <form
            action={routes.FORGOTTEN_PASSWORD_ACTION}
            method="post"
            name="form"
          >
            <h3 id="login">J'ai oublié mon mot de passe</h3>
            {error ? <div className="notification error">{error}</div> : ''}
            {success ? (
              <div className="notification success">{success}</div>
            ) : (
              ''
            )}
            <div className="form__group">
              <label htmlFor="email">Courrier électronique</label>
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
                Je demande à renouveller mon mot de passe
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
