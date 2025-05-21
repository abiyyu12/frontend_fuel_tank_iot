import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import 'datatables.net-bs5'
import $ from 'jquery'
import 'datatables.net'
import 'datatables.net-buttons-bs5'
import 'datatables.net-buttons/js/buttons.html5'
import jszip from 'jszip'
import Swal from 'sweetalert2'

const TodayFuelConsumption = () => {
  const tableRef = useRef(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [tableData, setTableData] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka)
  }

  const fetchData = async () => {
    try {
      setInitialLoading(true)
      setErrorMessage('') // Reset pesan error sebelum request

      const response = await axios.get(
        'https://hare-proud-ghastly.ngrok-free.app/api/sensors/flow-meter/today',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'ngrok-skip-browser-warning': 'true',
          },
          withCredentials: true,
        },
      )

      if (response.data.flow_meter_data.length === 0) {
        setErrorMessage('Data Not Found.')
      }

      const formattedData = response.data.flow_meter_data.map((row) => ({
        flow_liter: row.flow_liter,
        timestamp: row.timestamp,
        price: formatRupiah(row.price),
      }))
      setTableData(formattedData)
    } catch (error) {
      if (error.response.status === 404) {
        setErrorMessage('Data Not Found.')
      } else if (error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please log in again.',
          confirmButtonText: 'OK',
        }).then(() => {
          localStorage.removeItem('authToken')
          navigate('/login')
        })
      } else {
        setErrorMessage('Terjadi kesalahan saat mengambil data.')
      }
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!tableRef.current) return
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy()
    }

    $(tableRef.current).DataTable({
      data: tableData.map((row) => [row.timestamp, row.flow_liter, row.price]),
      columns: [{ title: 'Times' }, { title: 'Consumption (Liter)' }, { title: 'Price (IDR)' }],
      paging: true,
      searching: true,
      ordering: true,
      responsive: true,
      lengthMenu: [
        [10, 25, 50, -1],
        [10, 25, 50, 'All'],
      ],
      pageLength: 10,
      dom:
        "<'row'<'col-md-2 mb-2'l><'col-md-4 ms-auto mb-3'f>>" +
        "<'row'<'col-md-12 mb-3'tr>>" +
        "<'row'<'col-md-12 d-flex justify-content-end'p><'col-md-4'i>>B",
      buttons: [
        {
          extend: 'excelHtml5',
          text: ' Export Excel',
          className: 'ms-auto btn btn-success mb-2 text-white',
          title: 'Data Konsumsi Bahan Bakar Hari Ini',
          exportOptions: {
            columns: [0, 1, 2],
          },
        },
      ],
    })
  }, [tableData])

  if (initialLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    )
  }

  return (
    <div className="table-container">
      {errorMessage ? (
        <div className="alert alert-danger text-center">{errorMessage}</div>
      ) : (
        <table ref={tableRef} className="display custom-table dark-mode"></table>
      )}
    </div>
  )
}

export default TodayFuelConsumption
