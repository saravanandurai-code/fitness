import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Habits from './pages/Habits'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Nutrition from './pages/Nutrition'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import ProgressPage from './pages/Progress'
import Sleep from './pages/Sleep'
import WorkoutPage from './pages/Workout'
import { StoreProvider, useAppState } from './state/store'

function RequireOnboarding() {
  const state = useAppState()
  if (!state.onboarded) return <Navigate to="/welcome" replace />
  return <Outlet />
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/welcome" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<RequireOnboarding />}>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/sleep" element={<Sleep />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
