import Header from '../components/Header'
import EventCard from '../components/EventCard'
import MembersCarousel from '../components/MembersCarousel'
import DirectorSection from '../components/DirectorSection'
import AboutSection from '../components/AboutSection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <EventCard />
        <MembersCarousel />
        <DirectorSection />
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}
