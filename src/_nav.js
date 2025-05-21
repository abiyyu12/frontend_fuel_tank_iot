import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilWarning, cilScreenDesktop, cilSpeedometer } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Theme',
  },
  {
    component: CNavItem,
    name: 'Fuel Monitoring',
    to: '/fuel-monitoring',
    icon: <CIcon icon={cilScreenDesktop} customClassName="nav-icon" />,
  },
]

export default _nav
