import { FunctionalComponent } from 'preact'
import { Frontmatter } from 'wilson'
import classes from './about.module.scss'

export const Page: FunctionalComponent = () => (
  <h1 className={classes.headline}>{frontmatter.title}</h1>
)

export const frontmatter: Frontmatter = {
  title: 'About',
  draft: false,
}
