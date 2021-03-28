import { ReactNode } from 'react'
import classes from './Header.module.scss'
import Logo from './Logo'
import { Link } from 'react-router-dom'

interface Props {
  children?: ReactNode
}

function Menu() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/writing">Writing</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
    </nav>
  )
}

export default function Header({ children }: Props) {
  return (
    <header>
      <div>
        <div className={classes.foo}>
          <a href="/">
            <Logo />
          </a>
          <Menu />
        </div>
        {children && <div className={classes.wat}>{children}</div>}
      </div>
    </header>
  )
}
