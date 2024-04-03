import userApi from '../api/userApi'
import { getAllProvinces } from './api-address'
import { setFieldError, setFieldValue } from './common'
import * as yup from 'yup'

export function displayTextStatus(status) {
  return +status === 1
    ? 'Huỷ đơn'
    : +status === 4
    ? 'Đã huỷ'
    : +status === 2
    ? 'Đang vận chuyển'
    : 'Đã nhận hàng'
}
function setValuesForm(formCheckout, user) {
  setFieldValue(formCheckout, "input[name='fullname']", user?.fullname)
  setFieldValue(formCheckout, "input[name='email']", user?.email)
  setFieldValue(formCheckout, "input[name='phone']", user?.phone)
}
function getValuesForm(formCheckout) {
  const formValues = {}
  const data = new FormData(formCheckout)
  for (const [key, value] of data) {
    formValues[key] = value
  }
  return formValues
}
function getCheckoutSchema() {
  return yup.object({
    fullname: yup.string().required('Phải nhập tên đầy dủ'),
    email: yup
      .string()
      .required('Không được để trống trường này')
      .email('Trường này phải là email'),
    address: yup.string().required('Không được để trống trường này'),
    phone: yup
      .string()
      .required('Không được để trống trường này')
      .matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ')
      .typeError('Trường này chỉ nhập số'),
    province: yup.string().required('Province is required'),
    district: yup.string().required('District is required'),
    ward: yup.string().required('Ward is required'),
    note: yup.string(),
  })
}
async function validateCheckoutForm(formCheckout, formValues) {
  try {
    ;['fullname', 'email', 'address', 'phone', 'note', 'province', 'district', 'ward'].forEach(
      (name) => setFieldError(formCheckout, name, ''),
    )
    const schema = getCheckoutSchema()
    await schema.validate(formValues, {
      abortEarly: false,
    })
  } catch (error) {
    const errorLog = {}
    for (const validationError of error.inner) {
      const name = validationError.path
      if (errorLog[name]) continue
      setFieldError(formCheckout, name, validationError.message)
      errorLog[name] = true
    }
  }
  const isValid = formCheckout.checkValidity()
  if (!isValid) formCheckout.classList.add('was-validated')
  return isValid
}
function removeUnusedFiedls(values) {
  const formValues = { ...values }
  formValues.address = `${formValues.province}, ${formValues.district}, ${formValues.ward}, ${formValues.address}`
  formValues.status = 1
  delete formValues.province
  delete formValues.district
  delete formValues.ward
  return formValues
}
export async function initFormCheckout({ idForm, cart, infoUserStorage, onSubmit }) {
  const formCheckout = document.querySelector(idForm)
  if (!formCheckout) return
  let isSubmitting = false
  if (infoUserStorage && Object.keys(infoUserStorage).length > 0) {
    const data = await userApi.getById(infoUserStorage.id)
    if (data.success) {
      const { user } = data
      setValuesForm(formCheckout, user)
    }
    await getAllProvinces('province')
    formCheckout.addEventListener('submit', async function (e) {
      e.preventDefault()
      if (isSubmitting) return
      const formValues = getValuesForm(formCheckout)
      const isValid = await validateCheckoutForm(formCheckout, formValues)
      if (!isValid) return
      const formValuesFinal = removeUnusedFiedls(formValues)
      onSubmit?.(formValuesFinal, infoUserStorage.id, cart)
      isSubmitting = true
    })
  } else {
    return
  }
}
