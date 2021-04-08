import './App.scss'
import Header from './Header'
import { routes } from 'wilson/virtual'
import Router, { Route } from 'preact-router'
import { FunctionalComponent } from 'preact'

const NotFound: FunctionalComponent = () => <h1>not found.</h1>

export const App: FunctionalComponent<{ url?: string }> = ({ url }) => {
  return (
    <>
      <Header />
      <Router url={url}>
        {routes}
        <Route default component={NotFound} />
      </Router>
    </>
  )
}
