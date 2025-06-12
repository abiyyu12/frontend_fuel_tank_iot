import { element } from 'prop-types'
import React from 'react'
import MainFuelMonitorinig from './views/fuel_monitoring/MainFuelMonitorinig'
import Profile from './views/profile/Profile'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/fuel-monitoring', name: 'Fuel-Monitoring', element: MainFuelMonitorinig },
  { path: '/profile', name: 'Profile', element: Profile },
]

export default routes
