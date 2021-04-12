import { useTitle } from 'hoofd/preact'
import { FunctionalComponent } from 'preact'
import classes from './about.module.scss'

const AboutPage: FunctionalComponent = () => {
  useTitle('About')
  return <h1 className={classes.headline}>About</h1>
}

export default AboutPage
