import { FunctionalComponent } from 'preact'
import { markdownPages } from 'wilson/virtual'
import { Frontmatter } from 'wilson'

export const Page: FunctionalComponent = () => (
  <>
    <h1>{frontmatter.title}</h1>
    {markdownPages.map(({ result: { url }, frontmatter }) => {
      return (
        <li key={url}>
          <a href={url}>{frontmatter?.title ?? url}</a>
        </li>
      )
    })}
  </>
)

export const frontmatter: Frontmatter = {
  title: 'Writing',
  draft: false,
}
