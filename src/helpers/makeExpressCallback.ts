import { Request, Response, NextFunction } from 'express'

import querystring from 'querystring'

import { User } from '../entities'

import { Controller } from '../types'

export default function makeExpressCallback(controller: Controller) {
  return (req: Request, res: Response) => {
    const httpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
      user: <User>req.user,
      file: req.file
      // ip: req.ip,
      // method: req.method,
      // path: req.path,
      // headers: {
      //   'Content-Type': req.get('Content-Type'),
      //   Referer: req.get('referer'),
      //   'User-Agent': req.get('User-Agent')
      // }
    }

    controller(httpRequest)
      .then(httpResponse => {
        // if (httpResponse.headers) {
        //   res.set(httpResponse.headers)
        // }
        // res.type('json')

        if ('redirect' in httpResponse) {
          const redirectTo: string =
            httpResponse.redirect +
            '?' +
            (httpResponse.query
              ? querystring.stringify(httpResponse.query)
              : '')
          // console.log('redirecting to ', redirectTo, httpResponse.redirect)
          res.redirect(redirectTo)
        } else {
          res.status(httpResponse.statusCode).send(httpResponse.body)
        }
      })
      .catch(e => res.status(500).send({ error: 'An unkown error occurred.' }))
  }
}
