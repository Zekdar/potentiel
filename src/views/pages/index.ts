import * as fs from 'fs'
import * as path from 'path'

import * as ReactDOMServer from 'react-dom/server'

import AdminLogin from './adminLogin'

const AdminLoginPage = makePresenterPage(AdminLogin)

export { AdminLoginPage }

/**
 * Turn a Page Component (pure) into a presenter that returns a full HTML page
 * @param pageComponent
 */
function makePresenterPage(pageComponent: React.StatelessComponent) {
  return (props?: any) =>
    insertIntoHTMLTemplate(
      ReactDOMServer.renderToStaticMarkup(pageComponent(props))
    )
}

const headerPartial = fs.readFileSync(
  path.resolve(__dirname, '../template/header.html.partial')
)
const footerPartial = fs.readFileSync(
  path.resolve(__dirname, '../template/footer.html.partial')
)

/**
 * Insert html contents into the full template
 * @param htmlContents
 */
function insertIntoHTMLTemplate(htmlContents: string): string {
  return headerPartial + htmlContents + footerPartial
}
