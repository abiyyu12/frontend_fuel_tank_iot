import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import 'datatables.net-bs5'
import $ from 'jquery'
import 'datatables.net'
import '../base/tables/tableStyle.css'
import Swal from 'sweetalert2'
import 'datatables.net-buttons-bs5'
import 'datatables.net-buttons/js/buttons.html5'
import jszip from 'jszip'

// Harus di-global agar DataTables bisa akses JSZip
window.JSZip = jszip

const AllDataFuelConsumption = () => {
  const navigate = useNavigate()
  const tableRef = useRef(null)
  const [tableData, setTableData] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(null)

  const formatDateTimeUTC = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })
  }
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0, // Tanpa desimal
    }).format(angka)
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const fetchData = async () => {
    setInitialLoading(true)
    setError(null)

    try {
      const response = await axios.get(
        'https://hare-proud-ghastly.ngrok-free.app/api/sensors/flow-meter',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'ngrok-skip-browser-warning': 'true',
          },
          withCredentials: true,
        },
      )

      const data = response.data.data
      const formattedData = Object.keys(data).map((key) => ({
        timestamp: key,
        flow_liter: data[key].flow_liter,
        price: data[key].price,
      }))
      setTableData(formattedData)
    } catch (error) {
      console.error('Error fetching data:', error)
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          confirmButtonText: 'OK',
        }).then(() => {
          localStorage.removeItem('authToken')
          navigate('/login')
        })
      } else {
        setError('Failed to fetch data')
      }
    } finally {
      setInitialLoading(false)
    }
  }

  const handleDelete = async (timestamp) => {
    Swal.fire({
      title: 'Confirmation',
      text: 'Are Your Sure Delete This Data?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://hare-proud-ghastly.ngrok-free.app/api/sensors/flow-meter/${timestamp}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'ngrok-skip-browser-warning': 'true',
              },
              withCredentials: true,
            },
          )

          // Hapus dari state
          setTableData((prevData) => prevData.filter((row) => row.timestamp !== timestamp))
          Swal.fire('Deleted!', 'Data Has Been Deleted.', 'success')
        } catch (error) {
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
          } else {
            Swal.fire('Error!', 'Failed Delete Data.', 'error')
          }
        }
      }
    })
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
      data: tableData.map((row) => [
        formatDateTimeUTC(row.timestamp),
        row.flow_liter,
        formatRupiah(row.price),
        `<button class="delete-btn btn btn-danger text-white" data-id="${row.timestamp}">
           Delete
         </button>`,
      ]),
      columns: [
        { title: 'Date' },
        { title: 'Consumption (Liter)' },
        { title: 'Price' },
        { title: 'Delete', orderable: false },
      ],
      paging: true,
      searching: true,
      ordering: true,
      responsive: true,
      lengthMenu: [
        [10, 25, 50, -1],
        [10, 25, 50, 'All'],
      ], // Opsi jumlah data per halaman
      pageLength: 10, // Default jumlah data per halaman
      dom:
        "<'row'<'col-md-2 mb-2'l><'col-md-4 ms-auto mb-3'f>>" +
        "<'row'<'col-md-12 mb-3'tr>>" +
        "<'row'<'col-md-12 d-flex justify-content-end'p><'col-md-4'i>>B",
      buttons: [
        {
          extend: 'excelHtml5',
          text: ' Export Excel',
          className: 'ms-auto btn btn-success mb-2 text-white',
          title: 'Data Konsumsi BBM',
          exportOptions: {
            columns: [0, 1, 2], // Hanya ekspor kolom Tanggal, Konsumsi, dan Harga
          },
        },
      ],
    })

    $(tableRef.current).on('click', '.delete-btn', function () {
      const timestamp = $(this).data('id')
      handleDelete(timestamp)
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

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>
  }

  return (
    <div className="table-container">
      <table ref={tableRef} className="display custom-table dark-mode"></table>
    </div>
  )
}

export default AllDataFuelConsumption
