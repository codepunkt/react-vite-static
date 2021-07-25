import { FunctionalComponent } from 'preact'
import classes from './page.module.scss'
import '../assets/global.scss'
import Menu from '../components/menu'

const PageLayout: FunctionalComponent = ({ children }) => {
  return (
    <div className={classes.container}>
      <Menu />
      <main className={classes.main}>{children}</main>
    </div>
  )
}

export default PageLayout
