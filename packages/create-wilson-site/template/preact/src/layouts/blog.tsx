import { ContentPageProps } from 'wilson'
import { FunctionalComponent } from 'preact'
import classes from './blog.module.scss'
import '../assets/global.scss'

const BlogLayout: FunctionalComponent<ContentPageProps> = ({
  children,
  title,
}) => {
  return (
    <article className={classes.markdown}>
      <h1>Table of contents</h1>
      <div>wat</div>
      <h1>{title}</h1>
      {children}
    </article>
  )
}

export default BlogLayout
