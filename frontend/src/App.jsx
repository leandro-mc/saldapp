import { Route, Routes } from 'react-router-dom'
import GroupPage from './pages/GroupPage.jsx'
import HomePage from './pages/HomePage.jsx'
import { DemoBanner } from './components/demo/lazyDemo.jsx'
import AppHeader from './components/layout/AppHeader.jsx'

function App() {
  return (
    <>
      {/* First thing a keyboard user reaches: skip the repeated header and jump to the page */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded
                   focus:bg-white focus:px-4 focus:py-2 focus:font-medium focus:text-blue-700 focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <DemoBanner />
      <AppHeader />
      <main id="contenido">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path='/groups/:id' element={<GroupPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
