import { FunctionalComponent } from 'preact'

const Menu: FunctionalComponent = () => {
  return (
    <nav>
      <ol>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/blog">Blog</a>
        </li>
      </ol>
    </nav>
  )
}

export default Menu
