import { setFieldError, setFieldValue } from './common'
import * as yup from 'yup'
function setFormValues(form, defaultValues) {
  if (!form && !defaultValues) return
  setFieldValue(form, "input[name='oldPassword']", defaultValues?.password)
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
function getSchema() {
  return yup.object({
    oldPassword: yup.string().required('Phải nhập vào mật khẩu cũ'),
    password: yup
      .string()
      .required('Phải nhập vào mật khẩu mới')
      .min(6, 'Mật khẩu ít nhất 6 ký tự'),
    retypePassword: yup
      .string()
      .required('Phải nhập lại mật khẩu mới')
      .oneOf([yup.ref('password')], 'Mật khẩu nhập lại không khớp'),
  })
}
async function handleValidateForm(form, formValues) {
  try {
    ;['oldPassword', 'password', 'retypePassword'].forEach((name) => setFieldError(form, name, ''))
    const schema = getSchema()
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
export function initFormPassword({ idForm, defaultValues, onSubmit }) {
  const form = document.getElementById(idForm)
  if (!form) return
  setFormValues(form, defaultValues)
  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    const formValues = getFormValues(form)
    formValues.id = defaultValues.id
    const isValid = await handleValidateForm(form, formValues)
    if (!isValid) return
    await onSubmit?.(formValues)
  })
}
