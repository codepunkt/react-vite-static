import { Frontmatter } from 'wilson'
import { FunctionalComponent } from 'preact'
import classes from './default.module.scss'
import '../assets/global.scss'
import Menu from '../components/menu'

const DefaultLayout: FunctionalComponent<{ frontmatter: Frontmatter }> = ({
  children,
  frontmatter,
}) => {
  return (
    <div className={classes.container}>
      <Menu />
      <main>{children}</main>
    </div>
  )
}

export default DefaultLayout
