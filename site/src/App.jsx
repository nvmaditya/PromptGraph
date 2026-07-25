import Nav from './components/Nav'
import Hero from './components/Hero'
import Pipeline from './components/Pipeline'
import Mechanism from './components/Mechanism'
import Quickstart from './components/Quickstart'
import OpenSource from './components/OpenSource'
import Footer from './components/Footer'
import { useScrollReveal } from './hooks/useScrollReveal'

export default function App() {
  useScrollReveal()
  return (
    <>
      <Nav />
      <Hero />
      <Pipeline />
      <Mechanism />
      <Quickstart />
      <OpenSource />
      <Footer />
    </>
  )
}
