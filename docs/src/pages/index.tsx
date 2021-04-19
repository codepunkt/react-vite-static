import { Frontmatter } from 'wilson'
import { FunctionalComponent } from 'preact'
import classes from './index.module.scss'
import logoSrc from '../assets/wilson.svg'
import InstallButton from '../components/install-button'

export const Page: FunctionalComponent = () => {
  return (
    <div className={classes.hero}>
      <div className={classes.logo}>
        <img src={logoSrc} alt="wilsonjs" />
        <span>wilson</span>
      </div>
      <h1 className={classes.claim}>
        A blazing fast static site generator for the modern web.
        {/*Rapidly build modern websites without ever leaving your HTML.*/}
      </h1>
      <p className={classes.description}>
        Based on <a href="https://preactjs.com/">Preact</a> and{' '}
        <a href="https://vitejs.dev/">Vite</a>, Wilson makes the hardest parts
        of building an amazing experience simple and stays out of your way for
        everything else.
        {/*A utility-first CSS framework packed with classes like flex, pt-4,
        text-center and rotate-90 that can be composed to build any design,
        directly in your markup.*/}
      </p>
      <div className={classes.ctaWrapper}>
        <a href="docs" className={classes.cta}>
          Get started
        </a>
        <InstallButton />
        {/*<button type="button">
          <span>
            <span aria-hidden="true">$ </span>
            npx create-wilson-site
          </span>
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M8 16c0 1.886 0 2.828.586 3.414C9.172 20 10.114 20 12 20h4c1.886 0 2.828 0 3.414-.586C20 18.828 20 17.886 20 16v-4c0-1.886 0-2.828-.586-3.414C18.828 8 17.886 8 16 8m-8 8h4c1.886 0 2.828 0 3.414-.586C16 14.828 16 13.886 16 12V8m-8 8c-1.886 0-2.828 0-3.414-.586C4 14.828 4 13.886 4 12V8c0-1.886 0-2.828.586-3.414C5.172 4 6.114 4 8 4h4c1.886 0 2.828 0 3.414.586C16 5.172 16 6.114 16 8"></path>
          </svg>
      </button>*/}
      </div>
    </div>
  )
}

export const frontmatter: Frontmatter = {
  title: 'Blazing fast static sites for the modern web',
  draft: false,
}
