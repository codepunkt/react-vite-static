import { useTitle } from 'hoofd/preact'
import { FunctionalComponent } from 'preact'

const HomePage: FunctionalComponent = () => {
  useTitle('Home')
  return <h1>Home</h1>
}

export default HomePage
