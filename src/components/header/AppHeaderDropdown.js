import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CAvatar,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilUser, cilAccountLogout } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken') // Ambil token dari localStorage

    if (!token) {
      // Jika token tidak ada, arahkan ke halaman login
      navigate('/login')
      return
    }

    try {
      // Kirim permintaan DELETE untuk logout
      await axios.delete('https://hare-proud-ghastly.ngrok-free.app/api/logout', {
        headers: {
          Authorization: `Bearer ${token}`, // Kirim token dalam header Authorization
        },
        withCredentials: true,
      })

      // Menghapus token setelah logout
      localStorage.removeItem('authToken')
      navigate('/login?logout=success')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleProfile = () => {
    navigate('/profile')
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2 my-2">
          Account
        </CDropdownHeader>
        <CDropdownItem onClick={handleProfile} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
