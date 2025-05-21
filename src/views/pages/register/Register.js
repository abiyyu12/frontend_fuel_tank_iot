import React, { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilScreenSmartphone } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import DOMPurify from 'dompurify'

const Register = () => {
  const [validationErrors, setValidationErrors] = useState({})
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [retypePassword, setRetypePassword] = useState('')
  const [address, setAddress] = useState('')

  const [errorMessage, setErrorMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()

    // Reset previous validation errors
    setValidationErrors({})

    // Validasi password dan retypePassword
    if (password !== retypePassword) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        retypePassword: ['The passwords do not match.'],
      }))
      return
    }

    try {
      const sanitizedData = {
        email: DOMPurify.sanitize(email),
        password: DOMPurify.sanitize(password),
        name: DOMPurify.sanitize(name),
        address: DOMPurify.sanitize(address),
        phone: DOMPurify.sanitize(phone),
      }

      const response = await axios.post(
        'https://hare-proud-ghastly.ngrok-free.app/api/register',
        sanitizedData,
        {
          withCredentials: true,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        },
      )

      // Menampilkan SweetAlert jika registrasi berhasil
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: 'Please check your inbox for the verification email.',
        confirmButtonText: 'OK',
      }).then(() => {
        // Setelah SweetAlert ditutup, arahkan pengguna ke halaman login
        navigate('/login')
      })
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response
        if (status === 422 && data.error === 'Validation Error') {
          setValidationErrors(data.details)
        } else {
          setErrorMessage('Registration failed:' + data.error)
        }
      } else if (error.request) {
        console.error('No response received:', error.request)
        setValidationErrors({ general: ['Network error. Please check your connection.'] })
      } else {
        console.error('Error setting up the request:', error.message)
        setValidationErrors({ general: ['An unexpected error occurred.'] })
      }
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleRegister}>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>
                  {errorMessage && <p className="text-danger">{errorMessage}</p>}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </CInputGroup>
                  {validationErrors.name && (
                    <p className="text-danger">{validationErrors.name.join(', ')}</p>
                  )}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilScreenSmartphone} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Phone"
                      autoComplete="phone"
                      type="number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </CInputGroup>
                  {validationErrors.phone && (
                    <p className="text-danger">{validationErrors.phone.join(', ')}</p>
                  )}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </CInputGroup>
                  {validationErrors.email && (
                    <p className="text-danger">{validationErrors.email.join(', ')}</p>
                  )}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </CInputGroup>
                  {validationErrors.password && (
                    <p className="text-danger">{validationErrors.password.join(', ')}</p>
                  )}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      value={retypePassword}
                      onChange={(e) => setRetypePassword(e.target.value)}
                    />
                  </CInputGroup>
                  {validationErrors.retypePassword && (
                    <p className="text-danger">{validationErrors.retypePassword.join(', ')}</p>
                  )}
                  <CFormTextarea
                    className="mb-4"
                    id="exampleFormControlTextarea1"
                    label="Address"
                    placeholder="Input Your Address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></CFormTextarea>
                  {validationErrors.address && (
                    <p className="text-danger">{validationErrors.address.join(', ')}</p>
                  )}
                  <div className="d-grid">
                    <CButton color="success" type="submit" className="text-white">
                      Create Account
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
