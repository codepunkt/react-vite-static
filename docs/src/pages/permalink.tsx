import { FunctionalComponent } from 'preact'
import { Frontmatter } from 'wilson'

export const Page: FunctionalComponent<{ title: string }> = ({ title }) => {
  return (
    <>
      <h1>{title}</h1>
      <p>permalink changed</p>
    </>
  )
}

export const frontmatter: Frontmatter = {
  multiple: 'tags',
  title: 'Tag: {{tag}}',
  permalink: '/tag/{{tag}}/',
}
