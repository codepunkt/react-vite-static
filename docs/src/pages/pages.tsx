import { FunctionalComponent } from 'preact'
import { Frontmatter } from 'wilson'

export const Page: FunctionalComponent = ({
  // @ts-ignore
  frontmatter,
  // @ts-ignore
  inject: { pages },
}) => {
  console.log({ frontmatter, pages })
  return (
    <>
      <h1>{frontmatter.title}</h1>
      <div>{JSON.stringify(frontmatter)}</div>
    </>
  )
}

export const frontmatter: Frontmatter = {
  title: 'Inject test',
  inject: {
    pages: {
      collections: ['foo', 'moo'],
    },
  },
}
