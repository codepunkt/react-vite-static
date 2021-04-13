import { Frontmatter } from 'wilson'
import { FunctionalComponent } from 'preact'

export const Page: FunctionalComponent = () => <h1>{frontmatter.title}</h1>

export const frontmatter: Frontmatter = {
  title: 'Home',
  draft: false,
}
