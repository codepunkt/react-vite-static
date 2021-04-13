import { useTitle } from 'hoofd/preact'
import { FunctionalComponent } from 'preact'
import classes from './about.module.scss'

export const Page: FunctionalComponent = () => {
  useTitle('About')
  return <h1 className={classes.headline}>About</h1>
}
