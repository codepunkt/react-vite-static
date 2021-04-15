import { Frontmatter } from 'wilson'
import { FunctionalComponent } from 'preact'

export const Page: FunctionalComponent = () => <h1>Wilson</h1>

export const frontmatter: Frontmatter = {
  title: 'Blazing fast static sites for the modern web',
  draft: false,
}
