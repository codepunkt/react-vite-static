import { Frontmatter } from 'wilson'
import { FunctionalComponent } from 'preact'
import { usePages } from 'wilson/virtual'

export const Page: FunctionalComponent = () => {
  const pages = usePages()
  return (
    <div class="container">
      <h1>Blog posts</h1>
      <div className="paper">
        <pre>{JSON.stringify(pages, null, 2)}</pre>
      </div>
    </div>
  )
}

export const frontmatter: Frontmatter = {
  title: 'Blog posts',
}
