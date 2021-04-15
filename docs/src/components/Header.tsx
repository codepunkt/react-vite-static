import { FunctionalComponent } from 'preact'

const Menu: FunctionalComponent = () => (
  <>
    <a href="/">Home</a>
    <a href="/docs/">Docs</a>
  </>
)

const Header: FunctionalComponent = ({ children }) => (
  <>
    <Menu />
    {children}
  </>
)

export default Header
