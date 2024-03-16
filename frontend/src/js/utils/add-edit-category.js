import { setFieldError, setFieldValue } from './common'
import * as yup from 'yup'
function setFormValues(form, defaultValues) {
  setFieldValue(form, "input[name='title']", defaultValues?.title)
}
function getFormValues(form) {
  const formValues = {}
  const data = new FormData(form)
  for (const [key, value] of data) {
    formValues[key] = value
  }
  return formValues
}
function getCategorySchema() {
  return yup.object({
    title: yup
      .string()
      .required('Không được để trống trường này')
      .test(
        'at-least-two-words',
        'Danh mục phải tối thiểu 1 từ',
        (value) => value.split(' ').filter((x) => !!x && x.length >= 3).length >= 1,
      ),
  })
}
async function vaidateEditCategoryForm(form, formValues) {
  try {
    ;['title'].forEach((name) => setFieldError(form, name, ''))
    const schema = getCategorySchema()
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
export function initFormCategory({ idForm, defaultValues, onSubmit }) {
  const form = document.getElementById(idForm)
  const input = form.querySelector('input[name="title"]')
  if (!form || !input) return
  setFormValues(form, defaultValues)
  let isSubmitting = false
  input.addEventListener('blur', async function () {
    const formValues = getFormValues(form)
    await vaidateEditCategoryForm(form, formValues)
  })
  input.addEventListener('input', async function () {
    ;['title'].forEach((name) => setFieldError(form, name, ''))
  })
  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    if (isSubmitting) return
    const formValues = getFormValues(form)
    formValues.id = defaultValues.id
    const isValid = await vaidateEditCategoryForm(form, formValues)
    if (!isValid) return
    await onSubmit?.(formValues)
    isSubmitting = true
  })
}
