import { markdownPages } from 'wilson/virtual'
import { Link } from 'preact-router/match'

export default function WritingPage() {
  return (
    <>
      <h1>Writing</h1>
      {markdownPages.map(({ result: { url }, frontmatter }) => {
        return (
          <li key={url}>
            <Link href={url}>{frontmatter?.title ?? url}</Link>
          </li>
        )
      })}
    </>
  )
}
