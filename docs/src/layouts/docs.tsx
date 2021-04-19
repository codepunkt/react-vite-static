import { Frontmatter } from 'wilson'
import { FunctionalComponent } from 'preact'
import classes from './docs.module.scss'
import Header from '../components/header'
import Link from '../components/link'

const DocsLayout: FunctionalComponent<{ frontmatter: Frontmatter }> = ({
  children,
  frontmatter,
}) => {
  return (
    <div className={classes.container}>
      <Header withLogo />
      <main className={classes.main}>
        <aside className={classes.toc}>
          <p className={classes.headline}>Documentation</p>
          <ol className={classes.links}>
            <li>
              <Link href="/docs/why">Why Wilson</Link>
            </li>
            <li>
              <Link href="/docs">Getting started</Link>
            </li>
            <li>
              <Link href="/docs/features">Features</Link>
            </li>
            <li>
              <Link href="/docs/deploy">Deploying</Link>
            </li>
            <li>
              <Link href="/docs/comparison">Comparison</Link>
            </li>
          </ol>
        </aside>
        <article className={classes.markdown}>
          <h1>{frontmatter.title}</h1>
          {children}
        </article>
      </main>
    </div>
  )
}

export default DocsLayout
