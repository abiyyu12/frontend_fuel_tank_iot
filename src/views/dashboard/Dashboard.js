import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CCardTitle,
  CCardText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CSpinner,
} from '@coreui/react'
import 'react-circular-progressbar/dist/styles.css'
import './Sensors.css'
import axios from 'axios'
import Swal from 'sweetalert2'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const Dashboard = () => {
  const navigate = useNavigate()
  const [tankLevel, setTankLevel] = useState(0)
  const [smokeData, setSmokeData] = useState(0)
  const [maxTankLevel, setMaxTankLevel] = useState(0)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingPrice, setIsLoadingPrice] = useState(false)
  const [fuelPrice, setFuelPrice] = useState(0)
  const [error, setError] = useState(null)
  const [visible, setVisible] = useState(false)
  const [newPrice, setNewPrice] = useState('')
  const [flameSensor, setFlameSensor] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])
  const fetchData = async (isAutoReload = false) => {
    const token = localStorage.getItem('authToken')

    try {
      const [smokeResponse, volumeResponse, fuelPriceResponse, flameSensorResponse] =
        await Promise.all([
          axios.get('https://hare-proud-ghastly.ngrok-free.app/api/sensors/smoke', {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            withCredentials: true,
          }),
          axios.get('https://hare-proud-ghastly.ngrok-free.app/api/sensors/volume', {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            withCredentials: true,
          }),
          axios.get('https://hare-proud-ghastly.ngrok-free.app/api/fuel/price', {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            withCredentials: true,
          }),
          axios.get('https://hare-proud-ghastly.ngrok-free.app/api/sensors/flame', {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            withCredentials: true,
          }),
        ])

      const smokeDataBefore = smokeResponse.data.data
      smokeDataBefore.last_detected = dayjs
        .utc(smokeDataBefore.last_detected)
        .format('DD/MM/YYYY HH:mm')
      setSmokeData(smokeDataBefore)

      const { current_volume, max_tank } = volumeResponse.data
      setMaxTankLevel(max_tank)
      setTankLevel((current_volume / max_tank) * 100)

      setFuelPrice(
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(fuelPriceResponse.data.fuel_price.price),
      )

      const flameSensorSave = flameSensorResponse.data.data
      flameSensorSave.last_detected = dayjs
        .utc(flameSensorSave.last_detected)
        .format('DD/MM/YYYY HH:mm')
      setFlameSensor(flameSensorSave)
    } catch (error) {
      setError('Failed to fetch data')
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
      if (!isAutoReload) setInitialLoading(false)
      else setIsReloading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData()
    }, 4000)

    return () => clearTimeout(timeoutId)
  }, [])
  const openModal = () => {
    setVisible(true)
  }

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setVisible(false)
    setNewPrice('') // Reset input harga baru
  }

  const handleUpdatePrice = async (e) => {
    e.preventDefault() // Mencegah form submit default
    setIsLoadingPrice(true)
    try {
      // Kirim request ke API untuk mengubah harga bahan bakar
      console.log(newPrice)

      const response = await axios.post(
        'https://hare-proud-ghastly.ngrok-free.app/api/fuel/price',
        { price: newPrice },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'ngrok-skip-browser-warning': 'true',
          },
          withCredentials: true,
        },
      )
      Swal.fire({
        title: 'Price Updated',
        text: response.data.message,
        icon: 'success',
      })
      const fuelPriceResponse = await axios.get(
        'https://hare-proud-ghastly.ngrok-free.app/api/fuel/price',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          withCredentials: true,
        },
      )

      // Ambil nilai harga dari respons API
      const fuelPrice = fuelPriceResponse.data.fuel_price.price

      // Format harga ke dalam format Rupiah (IDR)
      const formattedFuelPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, // Menghilangkan desimal jika tidak diperlukan
      }).format(fuelPrice)
      setFuelPrice(formattedFuelPrice)
      closeModal()
    } catch (error) {
      console.error('Error updating fuel price:', error)
      alert('Error Updating Fuel Price')
    } finally {
      setIsLoadingPrice(false)
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

  if (error) {
    return (
      <CContainer className="mt-4 text-center text-danger">
        <p>{error}</p>
      </CContainer>
    )
  }

  return (
    <CContainer className="mt-4">
      <CRow>
        {/* Kolom 1: Monitoring Tangki */}
        <CCol md={12}>
          <CCard className="shadow pb-3">
            <CCardHeader className="bg-dark text-white text-center">
              <h4>Volume Tangki</h4>
            </CCardHeader>
            <CCardBody className="tank-container">
              <div className="tank">
                <div className="water" style={{ height: `${tankLevel}%` }}>
                  <div className="wave"></div>
                  <div className="wave wave2"></div>
                  <span className="percentage">
                    {((tankLevel / 100) * maxTankLevel).toFixed(1)} Liter ({tankLevel.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6} className="mt-3">
          <CCard className="shadow">
            <CCardHeader className="bg-dark text-white text-center">
              <h5>🔥 Flame Sensor Status</h5>
            </CCardHeader>
            <CCardBody className="text-center">
              <h4>
                {smokeData.smoke_detected ? (
                  <span className="text-danger">🔥 Flame Detected!</span>
                ) : (
                  <span className="text-primary">❄️ No Flame Detected</span>
                )}
              </h4>
              <p className="text-muted">
                <strong>Last Detected:</strong> {flameSensor.last_detected}
              </p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6} className="mt-3">
          <CCard className="shadow">
            <CCardHeader className="bg-dark text-white text-center">
              <h5>🚬 Smoke Sensor Status</h5>
            </CCardHeader>
            <CCardBody className="text-center">
              <h4>
                {flameSensor.flame_detected ? (
                  <span className="text-danger">🚬 Smoke Detected!</span>
                ) : (
                  <span className="text-primary">🚭 No Smoke Detected</span>
                )}
              </h4>
              <p className="text-muted">
                <strong>Last Detected:</strong> {smokeData.last_detected}
              </p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6} className="mt-3">
          <CCard className="shadow">
            <CCardHeader>Fuel</CCardHeader>
            <CCardBody>
              <CCardTitle>Solar Fuel Price: {fuelPrice} 1/L</CCardTitle>
              <CCardText>You can change the fuel price according to the market price.</CCardText>
              <CButton color="primary" onClick={openModal} className="ms-auto">
                Update Price
              </CButton>
            </CCardBody>
          </CCard>
          {/* Modal untuk Mengubah Harga Bahan Bakar */}
          <CModal visible={visible} onClose={closeModal}>
            <CModalHeader>
              <CModalTitle>Update Price</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CForm onSubmit={handleUpdatePrice}>
                <div className="mb-3">
                  <CFormLabel htmlFor="newPrice">New Price (IDR)</CFormLabel>
                  <CFormInput
                    type="number"
                    id="newPrice"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Insert New Price"
                    required
                  />
                </div>
                <CModalFooter>
                  <CButton color="secondary" onClick={closeModal}>
                    Cancel
                  </CButton>
                  <CButton color="primary" type="submit" disabled={loadingPrice}>
                    {loadingPrice ? <CSpinner size="sm" /> : 'Submit'}
                  </CButton>
                </CModalFooter>
              </CForm>
            </CModalBody>
          </CModal>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Dashboard
