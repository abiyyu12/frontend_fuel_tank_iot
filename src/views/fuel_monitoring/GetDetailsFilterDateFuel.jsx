import React, { useEffect, useRef, useState } from 'react'
import { CButton } from '@coreui/react'
import { cilArrowLeft } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import 'datatables.net-bs5'
import $ from 'jquery'
import 'datatables.net'
import 'datatables.net-buttons-bs5'
import 'datatables.net-buttons/js/buttons.html5'
import jszip from 'jszip'

const GetDetailsFilterDateFuel = ({ data, onBack }) => {
  const [tableData, setTableData] = useState([])
  const tableRef = useRef(null)

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka)
  }
  useEffect(() => {
    setTableData(data)

    if (!tableRef.current) return
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy()
    }

    $(tableRef.current).DataTable({
      data: tableData.map((row) => [row.timestamp, row.flow_liter, formatRupiah(row.price)]),
      columns: [{ title: 'Times' }, { title: 'Consumption (Liter)' }, { title: 'Price' }],
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
  return (
    <div className="mt-4">
      <CButton color="dark" onClick={onBack} className="mb-3 text-white">
        <CIcon icon={cilArrowLeft} className="me-2" /> Back
      </CButton>
      <table ref={tableRef} className="display custom-table dark-mode"></table>
    </div>
  )
}

export default GetDetailsFilterDateFuel
