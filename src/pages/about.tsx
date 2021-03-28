import imgUrl from './writing/what-exactly-is-vanilla-js/ecmascript-and-apis.svg'
import imgData from './writing/what-exactly-is-vanilla-js/ecmascript-and-apis.svg?raw'

export default function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <img src={imgUrl} />
      <div dangerouslySetInnerHTML={{ __html: imgData }} />
    </>
  )
}
