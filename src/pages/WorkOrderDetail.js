// src/components/workorders/WorkOrderDetail.js
import React, { useEffect, useState } from 'react'
import { Container, CircularProgress, Typography } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'

import Topbar from '../components/Topbar'
import NotificationSnackbar from '../components/ui/NotificationSnackbar'

// 🔹 New modular components
import WorkOrderHeader from '../components/workorders/WorkOrderHeader'
import WorkOrderContactSection from '../components/workorders/WorkOrderContactSection'
import WorkOrderItemsSection from '../components/workorders/WorkOrderItemsSection'
import WorkOrderFooterSection from '../components/workorders/WorkOrderFooterSection'

// 🔹 Services
import {
  fetchWorkOrderById,
  updateWorkOrderStatus,
} from '../services/workOrderServices'

// 🔹 Currency
import { useSettings } from '../context/SettingsContext'
import '../assets/styles/QuotationDetail.scss'

function WorkOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [workOrder, setWorkOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const [notif, setNotif] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const { settings } = useSettings()
  const currency = settings?.currency_code || '₹'

  /* ----------------------------------
     NOTIFICATION
  ---------------------------------- */
  const showNotification = (message, severity = 'success') => {
    setNotif({ open: true, message, severity })
  }

  /* ----------------------------------
     LOAD WORK ORDER
  ---------------------------------- */
  useEffect(() => {
    loadWorkOrder()
  }, [id])

  const loadWorkOrder = async () => {
    try {
      setLoading(true)
      const data = await fetchWorkOrderById(id)

      // Normalize numbers (same discipline as quotation)
      data.total_amount = Number(data.total_amount || 0)
      data.items = (data.items || []).map((it) => {
        const quantity = Number(it.quantity || 0)
        const unitPrice = Number(it.unit_price || 0)
        const discount = Number(it.discount || 0)
        const tax = Number(it.tax || 0)

        return {
          ...it,
          quantity,
          unit_price: unitPrice,
          discount,
          tax,
          line_total: Number(it.line_total ?? (quantity * unitPrice - discount + tax)),
        }
      })

      setWorkOrder(data)
    } catch (err) {
      console.error('❌ Failed to load work order', err)
      showNotification('Failed to load work order', 'error')
    } finally {
      setLoading(false)
    }
  }

  /* ----------------------------------
     STATUS CHANGE
  ---------------------------------- */
  const handleStatusChange = async (newStatus) => {
    try {
      await updateWorkOrderStatus(id, newStatus)
      showNotification('Status updated successfully')
      loadWorkOrder()
    } catch (err) {
      console.error('❌ Status update failed', err)
      showNotification('Failed to update status', 'error')
    }
  }

  /* ----------------------------------
     LOADING / NOT FOUND
  ---------------------------------- */
  if (loading) {
    return (
      <>
        <Topbar />
        <Container sx={{ mt: 4 }}>
          <CircularProgress />
        </Container>
      </>
    )
  }

  if (!workOrder) {
    return (
      <>
        <Topbar />
        <Container sx={{ mt: 4 }}>
          <Typography variant="h6">Work Order not found</Typography>
        </Container>
      </>
    )
  }

  /* ----------------------------------
     UI
  ---------------------------------- */
  return (
    <>
      <Topbar />
        {/* ================= HEADER ================= */}
        <div className="quotation-detail-container">
        <WorkOrderHeader
          workOrder={workOrder}
          onStatusChange={handleStatusChange}
        />

        {/* ================= CONTACT ================= */}
        <div className="quotation-card">
          <WorkOrderContactSection workOrder={workOrder} />
        </div>
        <div className="quotation-card">
          <WorkOrderItemsSection items={workOrder.items} />
        </div>
        <div className="quotation-card">
          <WorkOrderFooterSection
            total={workOrder.total_amount}
            subtotal={workOrder.display_taxable_subtotal ?? workOrder.subtotal}
            discount={workOrder._computed_discount}
            discountPercent={workOrder.discount_percent}
            currency={currency}
          />
        </div>

      </div>

      <NotificationSnackbar
        open={notif.open}
        message={notif.message}
        severity={notif.severity}
        onClose={() => setNotif((p) => ({ ...p, open: false }))}
      />
    </>
  )
}

export default WorkOrderDetail
