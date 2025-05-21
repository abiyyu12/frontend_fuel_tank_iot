import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import axios from 'axios'
import Swal from 'sweetalert2'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false) // State untuk loading login
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const logoutMessage = searchParams.get('logout')

  const handleResetPassword = async () => {
    if (!resetEmail) {
      Swal.fire({
        title: 'Warning!',
        text: 'Email cannot be empty.',
        icon: 'warning',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      Swal.fire({
        title: 'Invalid Email!',
        text: 'Please enter a valid email address.',
        icon: 'warning',
      })
      return
    }

    setIsResetting(true)

    try {
      await axios.post(
        'https://hare-proud-ghastly.ngrok-free.app/api/reset-password',
        {
          email: resetEmail,
        },
        {
          withCredentials: true,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        },
      )
      Swal.fire({
        title: 'Success!',
        text: 'Password reset instructions have been sent to your email.',
        icon: 'success',
      })
      setShowModal(false)
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to reset password, because your email not registered on application.',
        icon: 'error',
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true) // Set loading state untuk login

    try {
      const response = await axios.post('https://hare-proud-ghastly.ngrok-free.app/api/login', {
        email: email,
        password: password,
        withCredentials: true,
      })
      const token = response.data.token
      localStorage.setItem('authToken', token)
      Swal.fire({
        title: 'Login Successful!',
        text: 'You are logged in now.',
        icon: 'success',
      }).then(() => {
        navigate('/dashboard')
      })
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response
        if (status === 422 && data.error === 'Validation Error') {
          setValidationErrors(data.details)
        } else if (status === 403) {
          setErrorMessage(data.error)
        } else {
          setErrorMessage(data.error || 'Login failed. Please try again.')
        }
      } else {
        setErrorMessage('Network error. Please check your connection.')
      }
    } finally {
      setIsLoggingIn(false) // Reset loading state setelah proses selesai
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            {logoutMessage === 'success' && (
              <div className="alert alert-success" role="alert">
                You have been logged out successfully!
              </div>
            )}
          </CCol>
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    {errorMessage && <p className="text-danger">{errorMessage}</p>}

                    {validationErrors.email && (
                      <p className="text-danger">{validationErrors.email.join(', ')}</p>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </CInputGroup>

                    {validationErrors.password && (
                      <p className="text-danger">{validationErrors.password.join(', ')}</p>
                    )}

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          type="submit"
                          color="primary"
                          className="px-4"
                          disabled={isLoggingIn}
                        >
                          {isLoggingIn ? <CSpinner size="sm" /> : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0" onClick={() => setShowModal(true)}>
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Register to create a new account. Enter your information correctly to access
                      the system after successful registration.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>

      {/* Modal untuk Reset Password */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Reset Password</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Enter your email to receive reset password link</p>
          <CFormInput
            type="email"
            placeholder="Email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            disabled={isResetting}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleResetPassword} disabled={isResetting}>
            {isResetting ? <CSpinner size="sm" /> : 'Send Link'}
          </CButton>
          <CButton color="secondary" onClick={() => setShowModal(false)} disabled={isResetting}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Login
