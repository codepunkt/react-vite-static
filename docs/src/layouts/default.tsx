import { Frontmatter } from 'wilson'
import { FunctionalComponent } from 'preact'

const DefaultLayout: FunctionalComponent<{ frontmatter: Frontmatter }> = ({
  children,
  frontmatter,
}) => <div>{children}</div>

export default DefaultLayout
