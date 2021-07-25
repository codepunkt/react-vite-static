/**
 * @type { import('wilson').SiteConfig }
 */
module.exports = {
  siteData: {
    siteName: 'Site name',
    siteUrl: 'https://example.com',
    titleTemplate: '%s | Site name',
    description: 'Site description',
    author: 'Author name',
    lang: 'en',
  },
  layouts: {
    nestedLayouts: [{ pattern: 'blog/**/*', layout: 'blog' }],
  },
  opengraphImage: {
    background: '#ffffff',
    texts: [
      {
        font: 'src/assets/OpenSans-Regular.ttf',
        text: (frontmatter) => frontmatter?.title ?? 'Default opengraph title',
      },
    ],
  },
}
