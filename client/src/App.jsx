import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import AddJob from './pages/AddJob'
import EditJob from './pages/EditJob'
import Dashboard from './pages/Dashboard'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import { Toaster } from 'react-hot-toast'
import 'quill/dist/quill.snow.css'

const App = () => {
  return (
    <div>
      <Toaster position="top-right" />
      <Routes>
        {/* Public and User Routes */}
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
          <Route path='edit-job/:id' element={<EditJob/>}/>
          <Route path='manage-jobs' element={<ManageJobs/>}/>
          <Route path='view-applications' element={<ViewApplications/>}/>
          <Route path='applications/:jobId' element={<ViewApplications/>}/>
        </Route>
        
        {/* Admin Routes */}
        <Route path='/admin' element={<AdminLogin />} />
        <Route path='/admin/dashboard' element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
    </div>
  )
}

export default App
