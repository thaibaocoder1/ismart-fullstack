import userApi from '../api/userApi'
import roleApi from '../api/roleApi'
import {
  getRandomNumber,
  hideSpinner,
  setBackgroundImage,
  setFieldError,
  setFieldValue,
  showSpinner,
  toast,
} from '../utils'
import * as yup from 'yup'
function setFormValues(form, infoUser) {
  setFieldValue(form, "[name='fullname']", infoUser?.fullname)
  setFieldValue(form, "[name='username']", infoUser?.username)
  setFieldValue(form, "[name='email']", infoUser?.email)
  setFieldValue(form, "[name='phone']", infoUser?.phone)
  setFieldValue(form, "[name='imageUrl']", infoUser?.imageUrl)
  setBackgroundImage(document, 'img#imageUrl', infoUser?.imageUrl)
}

function initRandomImage(form) {
  if (!form) return
  const buttonRandom = form.querySelector('#randomBtn')
  if (buttonRandom) {
    buttonRandom.addEventListener('click', function () {
      const imageUrl = `https://picsum.photos/id/${getRandomNumber(1000)}/300/300`
      setFieldValue(form, "input[name='imageUrl']", imageUrl)
      setBackgroundImage(document, 'img#imageUrl', imageUrl)
    })
  }
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
    imageUrl: yup.string().required('Không được để trống').url('Chọn một đường dẫn hợp lệ'),
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
async function registerInfoAccountAdmin({ idForm, idAccount, onSubmit }) {
  const form = document.getElementById(idForm)
  if (!form) return
  try {
    showSpinner()
    const infoUser = await userApi.getById(idAccount)
    hideSpinner()
    setFormValues(form, infoUser)
    await renderRoles({
      idElement: 'role',
      idAccount,
    })
    initRandomImage(form)
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
async function renderRoles({ idElement, idAccount }) {
  const element = document.getElementById(idElement)
  if (!element) return
  try {
    showSpinner()
    const roles = await roleApi.getAll()
    hideSpinner()
    roles.forEach((role) => {
      const optionEl = document.createElement('option')
      optionEl.value = +role.id
      if (+role.id === idAccount) {
        optionEl.selected = 'selected'
      }
      optionEl.innerHTML = `<option value="${role.id}">${role.title}</option>`
      element.appendChild(optionEl)
    })
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}

async function handleOnSubmitForm(formValues) {
  try {
    showSpinner()
    const updateUser = await userApi.update(formValues)
    hideSpinner()
    if (updateUser) toast.success('Cập nhật thành công')
    setTimeout(() => {
      window.location.assign('/admin/account.html')
    }, 1000)
  } catch (error) {
    toast.error('Có lỗi trong khi cập nhật')
  }
}

// main
;(() => {
  const userInfoStorage = JSON.parse(localStorage.getItem('user_info'))
  const isHasAdmin = userInfoStorage.find((user) => user.roleID === 2)
  if (isHasAdmin) {
    registerInfoAccountAdmin({
      idForm: 'formAccountAdmin',
      idAccount: isHasAdmin.user_id,
      onSubmit: handleOnSubmitForm,
    })
  }
})()
