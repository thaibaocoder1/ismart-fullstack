import userApi from '../../../src/js/api/userApi'
import {
  getRandomNumber,
  hideSpinner,
  setBackgroundImage,
  setFieldError,
  setFieldValue,
  showSpinner,
  toast,
} from '../../../src/js/utils'
import * as yup from 'yup'
function setFormValues(form, infoUser) {
  setFieldValue(form, "[name='fullname']", infoUser?.fullname)
  setFieldValue(form, "[name='username']", infoUser?.username)
  setFieldValue(form, "[name='email']", infoUser?.email)
  setFieldValue(form, "[name='phone']", infoUser?.phone)
  setFieldValue(form, "[name='role']", infoUser?.role)
  setBackgroundImage(document, 'img#imageUrl', infoUser?.imageUrl)
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
    imageUrl: yup
      .mixed()
      .test('is-url', 'Chọn một đường dẫn hợp lệ', (value) => {
        if (!(value instanceof File) || !value.name) {
          return true
        }
      })
      .required('Không được để trống'),
  })
}

async function handleValidateForm(form, formValues) {
  try {
    ;['fullname', 'username', 'email', 'phone', 'imageUrl'].forEach((name) =>
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
function getFormValues(form) {
  if (!form) return
  const formValues = {}
  const data = new FormData(form)
  for (const [key, value] of data) {
    formValues[key] = value
  }
  return formValues
}
function jsonToFormData(formValues) {
  const formData = new FormData()
  for (const key in formValues) {
    formData.set(key, formValues[key])
  }
  return formData
}
function initUploadFile(form) {
  const inputFile = form.querySelector('input#formFile')
  if (inputFile) {
    inputFile.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        const imageUrl = URL.createObjectURL(file)
        setBackgroundImage(form, 'img#imageUrl', imageUrl)
      }
    })
  }
}
async function registerInfoAccountAdmin({ idForm, idAccount, onSubmit }) {
  const form = document.getElementById(idForm)
  if (!form) return
  try {
    showSpinner()
    const res = await userApi.getById(idAccount)
    hideSpinner()
    if (res.success) {
      const { user: infoUser } = res
      setFormValues(form, infoUser)
    }
    initUploadFile(form)
    form.addEventListener('submit', async function (e) {
      e.preventDefault()
      const formValues = getFormValues(form)
      formValues.id = idAccount
      const isValid = await handleValidateForm(form, formValues)
      if (!isValid) return
      await onSubmit?.(formValues)
    })
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}

async function handleOnSubmitForm(formValues) {
  try {
    const formData = jsonToFormData(formValues)
    showSpinner()
    const updateUser = await userApi.updateFormData(formData)
    hideSpinner()
    if (updateUser.success) toast.success('Cập nhật thành công')
    setTimeout(() => {
      window.location.assign('/admin/account.html')
    }, 1000)
  } catch (error) {
    toast.error('Có lỗi trong khi cập nhật')
  }
}

// main
;(() => {
  const userInfoStorage = JSON.parse(localStorage.getItem('accessTokenAdmin'))
  if (userInfoStorage) {
    registerInfoAccountAdmin({
      idForm: 'formAccountAdmin',
      idAccount: userInfoStorage.id,
      onSubmit: handleOnSubmitForm,
    })
  }
})()
