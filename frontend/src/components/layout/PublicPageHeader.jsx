import { useContext } from 'react'
import Header from '../Header.jsx'
import { PresentationContext } from './PresentationContext.js'

export default function PublicPageHeader() {
  const insidePortal = useContext(PresentationContext)
  return insidePortal ? null : <Header />
}
