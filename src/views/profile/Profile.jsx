import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import avatar8 from './../../assets/images/avatars/8.jpg'
import axios from 'axios'

import {
  CForm,
  CFormInput,
  CFormTextarea,
  CButton,
  CCardBody,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import Swal from 'sweetalert2'

import DOMPurify from 'dompurify'

const Profile = () => {
  const navigate = useNavigate()

  const [initialLoading, setInitialLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userAddress, setUserAddress] = useState('')
  const [userID, setUserID] = useState('')

  const [profileUserName, setProfileUserName] = useState('')
  const [profileUserPhone, setProfileUserPhone] = useState('')
  const [loadingUpdateProfile, setLoadingUpdateProfile] = useState(false)

  // GET PROFILE
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/login')
    } else {
      fetchData(token)
    }
  }, [navigate])

  const fetchData = async (token) => {
    try {
      const userProfile = await axios.get('https://hare-proud-ghastly.ngrok-free.app/api/profile', {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        withCredentials: true,
      })

      const { name, phone, email, address, uid } = userProfile.data.user
      setUserName(name || '')
      setUserPhone(phone || '')
      setUserEmail(email || '')
      setUserAddress(address || '')
      setUserID(uid || '')

      // set For Profile Below Image
      setProfileUserName(name)
      setProfileUserPhone(phone)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // If Expired Token
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please log in again.',
          confirmButtonText: 'OK',
        }).then(() => {
          localStorage.removeItem('authToken')
          navigate('/login')
        })
      }
    } finally {
      setInitialLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoadingUpdateProfile(true)
    try {
      const token = localStorage.getItem('authToken')
      const updatedProfile = {
        name: DOMPurify.sanitize(userName),
        phone: DOMPurify.sanitize(userPhone),
        address: DOMPurify.sanitize(userAddress),
      }

      const response = await axios.put(
        'https://hare-proud-ghastly.ngrok-free.app/api/profile/' + userID,
        updatedProfile,
        {
          headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },

          withCredentials: true,
        },
      )

      // set For Profile Below Image
      setProfileUserName(userName)
      setProfileUserPhone(userPhone)

      Swal.fire({
        title: 'Profile Updated',
        text: response.data.message,
        icon: 'success',
      })
    } catch (error) {
      // if ExpiredToken
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please log in again.',
          confirmButtonText: 'OK',
        }).then(() => {
          localStorage.removeItem('authToken')
          navigate('/login')
        })
      }
    } finally {
      setLoadingUpdateProfile(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    )
  }

  return (
    <section className="vh-80">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col col-lg-8 mb-4 mb-lg-0">
            <div className="card mb-3" style={{ borderRadius: '0.5rem' }}>
              <div className="row g-0">
                <div
                  className="col-md-4 text-center text-white"
                  style={{
                    borderTopLeftRadius: '0.5rem',
                    borderBottomLeftRadius: '0.5rem',
                    backgroundImage: 'linear-gradient(to right, #2ecc71, #3498db)',
                  }}
                >
                  <div>
                    <img
                      src={avatar8}
                      alt="Avatar"
                      className="img-fluid mt-5 rounded mb-3"
                      style={{ width: '120px' }}
                    />
                  </div>
                  <h5>{profileUserName}</h5>
                  <p>{profileUserPhone}</p>
                </div>
                <div className="col-md-8">
                  <CForm onSubmit={handleUpdateProfile} autoComplete="off">
                    <CCardBody className="p-4">
                      <h6>Your Profile</h6>
                      <hr className="mt-0 mb-4" />

                      <CRow className="pt-1">
                        <CCol xs={12} className="mb-3">
                          <h6>Full Name</h6>
                          <CFormInput
                            type="text"
                            name="fullName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                          />
                        </CCol>
                      </CRow>

                      <CRow>
                        <CCol xs={12} className="mb-3">
                          <h6>Phone</h6>
                          <CFormInput
                            type="number"
                            name="phone"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                          />
                        </CCol>
                      </CRow>

                      <CRow className="pt-1">
                        <CCol xs={12} className="mb-3">
                          <h6>Email</h6>
                          <CFormInput type="email" value={userEmail} disabled />
                        </CCol>

                        <CCol xs={12} className="mb-3">
                          <h6>Address</h6>
                          <CFormTextarea
                            name="address"
                            value={userAddress}
                            onChange={(e) => setUserAddress(e.target.value)}
                            rows={3}
                          />
                        </CCol>
                      </CRow>

                      <div className="d-flex justify-content-end">
                        <CButton
                          className="text-white"
                          color="warning"
                          type="submit"
                          disabled={loadingUpdateProfile}
                        >
                          {loadingUpdateProfile ? <CSpinner size="sm" /> : 'Update Profile'}
                        </CButton>
                      </div>
                    </CCardBody>
                  </CForm>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile
