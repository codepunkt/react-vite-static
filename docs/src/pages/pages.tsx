import { FunctionalComponent } from 'preact'
import { Frontmatter } from 'wilson'

export const Page: FunctionalComponent = ({
  // @ts-ignore
  title,
  // @ts-ignore
  inject: { pages },
}) => {
  return (
    <>
      <h1>{title}</h1>
      <pre>{JSON.stringify(pages, null, 2)}</pre>
    </>
  )
}

export const frontmatter: Frontmatter = {
  title: 'Blog posts',
  inject: {
    pages: {
      collections: ['blog', 'til'],
    },
  },
}
