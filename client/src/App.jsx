import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import AddJob from './pages/AddJob'
import Dashboard from './pages/Dashboard'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import ProfilePage from './pages/ProfilePage'
import JobStatistics from './pages/JobStatistics'
import Recruiters from './pages/Recruiters'
import RecruiterStats from './pages/RecruiterStats'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import 'quill/dist/quill.snow.css'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route 
          path='/applications' 
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/profile' 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/dashboard' 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        >
          <Route path='add-job' element={<AddJob/>}/>
          <Route path='manage-jobs' element={<ManageJobs/>}/>
          <Route path='view-applications' element={<ViewApplications/>}/>
          <Route path='job-statistics' element={<JobStatistics/>}/>
          <Route path='recruiters' element={<Recruiters/>}/>
          <Route path='recruiter-stats' element={<RecruiterStats/>}/>
          <Route path='settings' element={<Settings/>}/>
        </Route>
      </Routes>
    </div>
  )
}

export default App
