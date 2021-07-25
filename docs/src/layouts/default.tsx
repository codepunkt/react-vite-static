import { FunctionalComponent } from 'preact'
import classes from './default.module.scss'
import Header from '../components/header'

const DefaultLayout: FunctionalComponent = ({ children }) => {
  return (
    <>
      <Header />
      <main className={classes.main}>{children}</main>
    </>
  )
}

export default DefaultLayout
