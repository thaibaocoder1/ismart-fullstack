import { setBackgroundImage, setFieldError } from './common'
import * as yup from 'yup'

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
    fullname: yup
      .string()
      .required('Không được để trống trường này')
      .test(
        'at-least-two-words',
        'Tên đầy đủ phải tối thiểu 3 từ',
        (value) => value.split(' ').filter((x) => !!x && x.length >= 2).length >= 2,
      ),
    username: yup.string().required('Không được để trống trường này'),
    email: yup
      .string()
      .email('Trường này phải là email')
      .required('Không được để trống trường này'),
    phone: yup
      .string()
      .required('Không được để trống trường này')
      .matches(/^(84|0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
    password: yup.string().required('Không được để trống trường này'),
  })
}

async function checkValidationForm(form, formValues) {
  try {
    ;['fullname', 'username', 'email', 'phone', 'password', 'imageUrl'].forEach((name) =>
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
function initUploadFile(form) {
  const inputFile = form.querySelector('input#formFile')
  if (inputFile) {
    inputFile.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        const imageUrl = URL.createObjectURL(file)
        setBackgroundImage(form, 'img#avatar', imageUrl)
      }
    })
  }
}
export function handleUpdateInfoUser({ idForm, user, onSubmit }) {
  const form = document.getElementById(idForm)
  if (!form) return
  initUploadFile(form)
  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    const formValues = getFormValues(form)
    formValues.id = user.id
    const isValid = await checkValidationForm(form, formValues)
    if (!isValid) return
    await onSubmit?.(formValues)
  })
}
