import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CSpinner,
  CForm,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
} from '@coreui/react'
import { cilCalendar, cilTrash, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import GetDetailsFilterDateFuel from './GetDetailsFilterDateFuel'

const FilterFuelConsumption = () => {
  const [lastWeekData, setLastWeekData] = useState([])
  const [initialLoading, setInitialLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [rawDataFlowMeter, setRawDataFlowMeter] = useState('')
  const [selectedDetailData, setSelectedDetailData] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  // Fungsi Format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  // Fungsi Fetch Data dengan Filter
  const fetchData = async (from = '', to = '') => {
    try {
      setInitialLoading(true)
      setErrorMessage('') // Reset error

      let url = 'https://hare-proud-ghastly.ngrok-free.app/api/sensors/flow-meter/filter-date'
      if (from && to) {
        url += `?start_date=${from}&end_date=${to}`
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        withCredentials: true,
      })

      const rawData = response.data.flow_meter_data
      setRawDataFlowMeter(rawData)

      setStartDate(response.data.from ? dayjs(response.data.from).format('YYYY-MM-DD') : '')
      setEndDate(response.data.to ? dayjs(response.data.to).format('YYYY-MM-DD') : '')

      if (!rawData || Object.keys(rawData).length === 0) {
        setLastWeekData([])
        setErrorMessage('No data was found for this date range.')
        return
      }

      // Proses Data
      const formattedData = Object.keys(rawData).map((date) => {
        const totalSpent = rawData[date].reduce((sum, entry) => sum + entry.price, 0)
        return {
          date,
          totalSpent: formatRupiah(totalSpent),
        }
      })

      setLastWeekData(formattedData)
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setErrorMessage('Data tidak ditemukan. Coba gunakan rentang tanggal lain.')
      } else if (error.response && error.response.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          confirmButtonText: 'OK',
        }).then(() => {
          localStorage.removeItem('authToken') // Hapus token yang expired
          navigate('/login') // Arahkan ke halaman login
        })
      } else {
        setErrorMessage('Terjadi kesalahan saat mengambil data.')
      }
      setLastWeekData([])
    } finally {
      setInitialLoading(false)
    }
  }

  // Handle Filter
  const handleFilter = () => {
    if (startDate && endDate) {
      fetchData(startDate, endDate)
    } else {
      alert('Please select the date range first!')
    }
  }

  // Reset Filter
  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    setLastWeekData([])
    setErrorMessage('')
  }

  const handleDetailClick = (data) => {
    setSelectedDetailData(data)
    setShowDetail(true)
  }

  const handleBackClick = () => {
    setShowDetail(false)
  }

  return (
    <CContainer className="mt-4">
      {showDetail ? (
        // Tampilan halaman detail
        <GetDetailsFilterDateFuel data={selectedDetailData} onBack={handleBackClick} />
      ) : (
        <>
          {/* Filter Tanggal */}
          <CCard className="mb-4 shadow-sm" style={{ borderRadius: '10px' }}>
            <CCardBody>
              <h5 className="text-center mb-3" style={{ fontWeight: 'bold' }}>
                Filter Date
              </h5>
              <CForm className="d-flex flex-wrap justify-content-center gap-3">
                {/* Input Tanggal Mulai */}
                <CInputGroup className="w-auto">
                  <CInputGroupText>
                    <CIcon icon={cilCalendar} />
                  </CInputGroupText>
                  <CFormInput
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </CInputGroup>

                {/* Input Tanggal Akhir */}
                <CInputGroup className="w-auto">
                  <CInputGroupText>
                    <CIcon icon={cilCalendar} />
                  </CInputGroupText>
                  <CFormInput
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </CInputGroup>

                {/* Tombol Filter */}
                <CButton color="primary" onClick={handleFilter}>
                  <CIcon icon={cilSearch} /> Filter
                </CButton>

                {/* Tombol Reset */}
                <CButton color="danger" variant="outline" onClick={handleReset}>
                  <CIcon icon={cilTrash} /> Reset
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>

          {/* Loading dan Data */}
          {initialLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading data...</p>
            </div>
          ) : errorMessage ? (
            <div className="alert alert-danger text-center">{errorMessage}</div>
          ) : lastWeekData.length > 0 ? (
            <CRow className="justify-content-center">
              <h4 className="text-center mb-4" style={{ fontWeight: 'bold' }}>
                Gasoline Usage Report {startDate ? formatDate(startDate) : ''} -{' '}
                {endDate ? formatDate(endDate) : ''}
              </h4>
              {lastWeekData.map((item, index) => (
                <CCol md={8} lg={6} className="mb-4" key={index}>
                  <CCard className="shadow-sm card-hover" style={{ borderRadius: '15px' }}>
                    <CCardHeader
                      className="text-white text-center bg-dark"
                      style={{ padding: '20px' }}
                    >
                      {item.date}
                    </CCardHeader>
                    <CCardBody className="text-center" style={{ padding: '30px' }}>
                      <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '10px' }}>
                        <strong>Total Cost:</strong>
                      </p>
                      <h3 style={{ fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
                        {item.totalSpent}
                      </h3>
                      <CButton
                        color="primary"
                        className="detail-button"
                        onClick={() => handleDetailClick(rawDataFlowMeter[item.date])}
                      >
                        Details
                      </CButton>
                    </CCardBody>
                  </CCard>
                </CCol>
              ))}
            </CRow>
          ) : (
            <div className="text-center">
              <p className="text-muted">Please select a date range to view the data.</p>
            </div>
          )}
        </>
      )}

      {/* CSS Tambahan */}
      <style>
        {`
          .card-hover {
            transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
            cursor: pointer;
          }
  
          .card-hover:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }
  
          .detail-button {
            transition: background 0.3s ease-in-out, transform 0.2s ease-in-out;
          }
  
          .detail-button:hover {
            background: #5a67d8;
            transform: scale(1.1);
          }
        `}
      </style>
    </CContainer>
  )
}

export default FilterFuelConsumption
