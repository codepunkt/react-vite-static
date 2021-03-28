import { Route, Switch } from 'react-router-dom'
import './App.module.scss'
import Header from './Header'
import PageInfoProvider from './PageInfoProvider'
// import meta from '~/.wilson/meta'

export function App() {
  // @ts-ignore
  const modules = import.meta.globEager('../pages/**/*.(tsx|md)')

  const pages = Object.keys(modules).map((path) => {
    const name = path.match(/\.\.\/pages\/(.*)\.(tsx|md)$/)![1]

    return {
      name,
      path: `/${name.toLowerCase().replace(/index$/, '')}/`.replace(
        /\/\/$/,
        '/'
      ),
      component: modules[path].default,
    }
  })

  return (
    <PageInfoProvider pages={pages}>
      <Header />
      <Switch>
        {pages.map(({ path, component: Component }) => {
          return (
            <Route key={path} path={path} exact>
              <Component />
            </Route>
          )
        })}
        <Route>
          <h1>Not Found</h1>
        </Route>
      </Switch>
    </PageInfoProvider>
  )
}
