import { FunctionalComponent } from 'preact'
import { Frontmatter } from 'wilson'

export const Page: FunctionalComponent = ({
  // @ts-ignore
  title,
}) => {
  return (
    <>
      <h1>{title}</h1>
      <p>permalink changed</p>
    </>
  )
}

export const frontmatter: Frontmatter = {
  title: 'Blog posts',
  permalink: '/wat/foo/blub/',
}
