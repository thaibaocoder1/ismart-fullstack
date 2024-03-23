import { setFieldError, setFieldValue } from './common'
import { toast } from './toast'
import * as yup from 'yup'

export function initProductComment({ idForm, infoUserStorage, productID, onSubmit }) {
  const form = document.getElementById(idForm)
  if (!form) return
  let isSubmitting = false
  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    if (isSubmitting) return
    const textareaEl = this.elements['comment']
    const value = textareaEl.value
    if (value.length === 0) {
      toast.error('Phải nhập vào bình luận')
      return
    }
    if (infoUserStorage && Object.keys(infoUserStorage).length > 1) {
      await onSubmit?.(value, productID, infoUserStorage.id)
      isSubmitting = true
    } else {
      toast.info('Cần phải đăng nhập mới có thể bình luận')
      return
    }
  })
}
function setFormValues(form, defaultValues) {
  if (!form || !defaultValues) return
  setFieldValue(form, "input[name='text']", defaultValues?.text)
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
    text: yup.string().required('Không được để trống trường này'),
  })
}
async function handleValidateForm(form, formValues) {
  try {
    ;['text'].forEach((name) => setFieldError(form, name, ''))
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
export function initCommentForm({ idForm, defaultValues, onSubmit }) {
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
