import { Link } from 'preact-router/match'
import { ComponentChildren } from 'preact'

interface Props {
  children?: ComponentChildren
}

function Menu() {
  return (
    <>
      <Link href="/">Home</Link>
      <Link href="/writing/">Writing</Link>
      <Link href="/about/">About</Link>
    </>
  )
}

export default function Header({ children }: Props) {
  return (
    <>
      <Menu />
      {children}
    </>
  )
}
