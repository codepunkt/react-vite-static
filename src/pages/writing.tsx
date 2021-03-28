import { Link } from 'react-router-dom'
import { usePageInfo } from '../components/PageInfoProvider'

export default function WritingPage() {
  const pageInfo = usePageInfo()
  return (
    <>
      <h1>Writing</h1>
      {pageInfo
        .filter(({ name }) => name.startsWith('writing/'))
        .map(({ name, path }) => {
          return (
            <li key={path}>
              <Link to={path}>{name}</Link>
            </li>
          )
        })}
    </>
  )
}
