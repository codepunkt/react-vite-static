declare module '*.svg' {
  import { FunctionComponent, JSX } from 'preact'
  const src: FunctionComponent<JSX.SVGAttributes>
  export default src
}
