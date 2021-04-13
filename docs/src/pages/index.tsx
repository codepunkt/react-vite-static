import { useTitle } from 'hoofd/preact'
import { FunctionalComponent } from 'preact'

export const Page: FunctionalComponent = () => {
  useTitle('Home')
  return <h1>Home</h1>
}
