import './app.css'
import { routes, siteData } from 'wilson/virtual'
import { ErrorBoundary, LocationProvider, Router } from 'preact-iso'
import { FunctionalComponent } from 'preact'
import { useTitleTemplate } from 'hoofd/preact'

const NotFound: FunctionalComponent = () => <>Not Found</>

const App: FunctionalComponent = () => {
  useTitleTemplate(siteData.titleTemplate)
  return (
    <LocationProvider>
      <div>
        <ErrorBoundary>
          <Router>{[...routes, <NotFound default />]}</Router>
        </ErrorBoundary>
      </div>
    </LocationProvider>
  )
}

export default App
