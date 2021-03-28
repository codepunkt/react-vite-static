import { ComponentType, createContext, ReactNode, useContext } from 'react'

interface Page {
  name: string
  path: string
  component: ComponentType
}

interface PageInfoProviderProps {
  children: ReactNode
  pages: Page[]
}

const PageInfoContext = createContext<Page[]>([])

export default function PageInfoProvider({
  children,
  pages,
}: PageInfoProviderProps) {
  return (
    <PageInfoContext.Provider value={pages}>
      {children}
    </PageInfoContext.Provider>
  )
}

export function usePageInfo() {
  const pageInfo = useContext(PageInfoContext)
  return pageInfo
}
