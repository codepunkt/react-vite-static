import { extname } from 'path'
import { Frontmatter } from '../types'

class PageFile {
  public route: string
  public path: string
  public frontmatter: Frontmatter

  constructor(frontmatter: Frontmatter, sourcePath: string) {
    this.frontmatter = frontmatter
    this.route = this.getRoute(sourcePath)
    this.path = this.getPath()
  }

  /**
   * Returns page route.
   *
   * @TODO validate permalink
   *   - does URL already exist?
   *   - is URL not empty?
   */
  private getRoute(sourcePath: string): string {
    if (this.frontmatter.permalink !== undefined) {
      return this.frontmatter.permalink.replace(
        /^\/?([^/]+(?:\/[^/]+)*)\/?$/,
        '/$1/'
      )
    }
    return `/${sourcePath
      .replace(new RegExp(`${extname(sourcePath)}$`), '')
      .replace(/index$/, '')}/`.replace(/\/\/$/, '/')
  }

  /**
   *
   */
  private getPath(): string {
    return this.route.split('/').pop() === 'index'
      ? `${this.route.replace(/^\//, '')}.html`
      : `${this.route.replace(/^\//, '')}index.html`
  }
}

export default PageFile
