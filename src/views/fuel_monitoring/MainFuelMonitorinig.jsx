import React, { useState } from 'react'
import { CFormSelect, CInputGroup, CContainer, CRow, CCol } from '@coreui/react'

import AllDataFuelConsumption from './AllDataFuelConsumption'
import TodayFuelConsumption from './TodayFuelConsumption'
import FilterFuelConsumption from './FilterFuelConsumption'

const MainFuelMonitoring = () => {
  const [selectedFilter, setSelectedFilter] = useState('1') // Default: "All"

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value)
  }

  return (
    <CContainer className="py-2">
      <CRow className="justify-content-start">
        <CCol md={4}>
          <CInputGroup className="mb-3 shadow-sm">
            <CFormSelect
              id="inputGroupSelect02"
              className="border-primary"
              value={selectedFilter}
              onChange={handleFilterChange}
            >
              <option value="1">All</option>
              <option value="2">Date Filter</option>
              <option value="3">Today</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Menampilkan komponen sesuai pilihan */}
      {selectedFilter === '2' ? (
        <FilterFuelConsumption />
      ) : selectedFilter === '3' ? (
        <TodayFuelConsumption />
      ) : (
        <AllDataFuelConsumption />
      )}
    </CContainer>
  )
}

export default MainFuelMonitoring
