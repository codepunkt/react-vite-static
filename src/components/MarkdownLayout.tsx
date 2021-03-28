interface Props {
  children: React.ReactNode
  frontmatter: {}
}

export default function MarkdownLayout({ children, frontmatter }: Props) {
  console.log(frontmatter)
  return (
    <>
      Post layout
      {children}
    </>
  )
}
