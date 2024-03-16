import orderApi from '../api/orderApi'
import orderDetailApi from '../api/orderDetailApi'
import productApi from '../api/productsApi'
import { showSpinner, hideSpinner, setFieldError, toast } from '../utils'
import * as yup from 'yup'

function registerStatusOrder(selectEl, status) {
  let tagArr = ['Chờ xác nhận', 'Đã xác nhận + vận chuyển', 'Đã nhận hàng', 'Đã huỷ']
  for (let i = 0; i < tagArr.length; ++i) {
    const optionEl = document.createElement('option')
    optionEl.value = i + 1
    if (status !== 1 && i === 0) {
      optionEl.disabled = true
    }
    if (+optionEl.value === status) {
      optionEl.selected = true
    }
    optionEl.innerHTML = `${tagArr[i]}`
    selectEl.appendChild(optionEl)
  }
}

function getFormValues(form) {
  if (!form) return
  const formValues = {}
  const data = new FormData(form)
  for (const [key, value] of data) {
    formValues[key] = value
  }
  return formValues
}

function getFormSchema() {
  return yup.object({
    status: yup.string(),
  })
}

async function handleValidationForm(form, formValues) {
  try {
    ;['status'].forEach((name) => setFieldError(form, name, ''))
    const schema = getFormSchema()
    await schema.validate(formValues, {
      abortEarly: false,
    })
  } catch (error) {
    const errorLog = {}
    for (const validationError of error.inner) {
      const name = validationError.path
      if (errorLog[name]) continue
      setFieldError(form, name, validationError.message)
      errorLog[name] = true
    }
  }
  const isValid = form.checkValidity()
  if (!isValid) form.classList.add('was-validated')
  return isValid
}

async function displayOrderInfo({ idForm, orderID, onSubmit }) {
  const form = document.getElementById(idForm)
  if (!form) return
  const selectEl = form.querySelector("[name='status']")
  try {
    showSpinner()
    const orderInfo = await orderApi.getById(orderID)
    hideSpinner()
    registerStatusOrder(selectEl, +orderInfo.status)
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const formValues = getFormValues(form)
      formValues.id = orderID
      const isValid = await handleValidationForm(form, formValues)
      if (!isValid) return
      await onSubmit?.(formValues)
    })
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}

function calcDateOrder(dateOrder, formatDate) {
  const timeDifference = formatDate - dateOrder
  const secondOfDay = 86400 * 1000
  return timeDifference > secondOfDay
}

async function handleOnSubmitForm(formValues) {
  try {
    const updateOrder = await orderApi.update(formValues)
    const orderID = updateOrder.id
    const dateOrder = updateOrder.orderDate
    const formatDate = new Date().getTime()
    const checkDate = calcDateOrder(dateOrder, formatDate)
    if (+updateOrder?.status === 4 || checkDate) {
      const orderDetail = await orderDetailApi.getAll()
      const orderDetailApply = orderDetail.filter((order) => order.orderID === orderID)
      for (const item of orderDetailApply) {
        const { productID, quantity } = item
        const productInfo = await productApi.getById(productID)
        const payload = {
          id: productID,
          quantity: +productInfo.quantity + quantity,
        }
        await productApi.update(payload)
      }
    }

    if (updateOrder) {
      toast.success('Cập nhật đơn hàng thành công')
      setTimeout(() => {
        window.location.assign('/admin/order.html')
      }, 1000)
    }
  } catch (error) {
    toast.error('Có lỗi trong khi chỉnh sửa')
  }
}
// main
;(() => {
  const searchParams = new URLSearchParams(location.search)
  const orderID = +searchParams.get('id')
  if (orderID) {
    displayOrderInfo({
      idForm: 'formOrder',
      orderID,
      onSubmit: handleOnSubmitForm,
    })
  }
})()
