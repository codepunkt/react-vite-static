import { FunctionalComponent } from 'preact'
import classes from './page.module.scss'
import '../assets/global.scss'

const PageLayout: FunctionalComponent = ({ children }) => {
  return <div className={classes.container}>{children}</div>
}

export default PageLayout
