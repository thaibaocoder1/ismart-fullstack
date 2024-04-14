import { setBackgroundImage, setFieldError, setFieldValue } from './common'
import * as yup from 'yup'
function setFormValues(form, defaultValues) {
  setFieldValue(form, "input[name='name']", defaultValues?.name)
  setFieldValue(form, "input[name='code']", defaultValues?.code)
  setFieldValue(form, "input[name='price']", defaultValues?.price)
  setFieldValue(form, "input[name='discount']", defaultValues?.discount)
  setFieldValue(form, "input[name='quantity']", defaultValues?.quantity)
  setFieldValue(form, "input[name='description']", defaultValues?.description)
  setFieldValue(form, "textarea[name='content']", defaultValues?.content)
  if (defaultValues?._id) {
    setBackgroundImage(form, 'img#imageUrl', `${defaultValues?.thumb.fileName}`)
  }
}
function getFormValues(form) {
  const formValues = {}
  const data = new FormData(form)
  for (const [key, value] of data) {
    formValues[key] = value
  }
  return formValues
}
function getSchema() {
  return yup.object({
    name: yup
      .string()
      .required('Không được để trống trường này')
      .test(
        'at-least-two-words',
        'Tên sản phẩm phải tối thiểu 3 từ',
        (value) => value.split(' ').filter((x) => !!x && x.length >= 2).length >= 2,
      ),
    code: yup
      .string()
      .required('Không được để trống trường này')
      .test('contain-string', 'Mã sản phẩm bắt đầu bằng BAODEV', (value) =>
        value.startsWith('BAODEV'),
      ),
    content: yup.string(),
    price: yup
      .number()
      .required()
      .positive('Giá trị phải là số dương')
      .integer()
      .typeError('Trường này phải là số'),
    discount: yup
      .number()
      .required()
      .integer()
      .max(99, 'Tối đa giảm 99%')
      .typeError('Trường này phải là số'),
    quantity: yup
      .number()
      .required()
      .positive('Giá trị phải là số dương')
      .integer()
      .typeError('Trường này phải là số'),
    thumb: yup.string().required('Vui lòng chọn ảnh sản phẩm'),
  })
}
function initUploadImage(form) {
  const imageEl = form.querySelector('input#formFile')
  if (!imageEl) return
  imageEl.addEventListener('change', function (e) {
    const files = e.target.files[0]
    if (files) {
      const imageUrl = URL.createObjectURL(files)
      setBackgroundImage(form, 'img#imageUrl', `${imageUrl}`)
    }
  })
}
async function validateAdminForm(form, formValues) {
  try {
    ;['name', 'code', 'price', 'quantity', 'content'].forEach((name) =>
      setFieldError(form, name, ''),
    )
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
export function initFormProduct({ idForm, defaultValues, onSubmit }) {
  const form = document.getElementById(idForm)
  if (!form) return
  const child = form.querySelectorAll('*:not(div):not(label):not(span)')
  child.forEach((item) => {
    if (item.tagName === 'INPUT') {
      item.addEventListener('blur', async () => {
        const formValues = getFormValues(form)
        const isValid = await validateAdminForm(form, formValues)
        if (!isValid) return
      })
    }
  })
  initUploadImage(form)
  setFormValues(form, defaultValues)
  let isSubmitting = false
  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    if (isSubmitting) return
    const formValues = getFormValues(form)
    formValues.id = defaultValues._id
    const isValid = await validateAdminForm(form, formValues)
    if (!isValid) return
    await onSubmit?.(formValues)
    isSubmitting = true
  })
}
