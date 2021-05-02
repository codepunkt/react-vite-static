import { FunctionalComponent } from 'preact'
import { Frontmatter } from 'wilson'

export const Page: FunctionalComponent<{
  title: string
  inject: { pages: unknown[] }
}> = ({ title, inject: { pages } }) => {
  return (
    <>
      <h1>{title}</h1>
      <pre>{JSON.stringify(pages, null, 2)}</pre>
    </>
  )
}

export const frontmatter: Frontmatter = {
  title: 'Blog posts',
  tags: ['foo'],
  inject: {
    pages: {
      collections: ['docs'],
    },
  },
}
