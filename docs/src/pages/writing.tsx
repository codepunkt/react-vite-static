import { FunctionalComponent } from 'preact'
import { markdownPages } from 'wilson/virtual'
import { useTitle } from 'hoofd/preact'

const WritingPage: FunctionalComponent = () => {
  useTitle('Writing')
  return (
    <>
      <h1>Writing</h1>
      {markdownPages.map(({ result: { url }, frontmatter }) => {
        return (
          <li key={url}>
            <a href={url}>{frontmatter?.title ?? url}</a>
          </li>
        )
      })}
    </>
  )
}

export default WritingPage
