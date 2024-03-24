import { getRandomNumber, setBackgroundImage, setFieldError, setFieldValue } from './common'
import { hideSpinner, showSpinner } from './spinner'
import * as yup from 'yup'

function setFormValues(form, defaultValues) {
  if (!form || !defaultValues) return
  setFieldValue(form, "input[name='fullname']", defaultValues?.fullname)
  setFieldValue(form, "input[name='username']", defaultValues?.username)
  setFieldValue(form, "input[name='email']", defaultValues?.email)
  setFieldValue(form, "input[name='phone']", defaultValues?.phone)
  setFieldValue(form, "input[name='password']", defaultValues?.password)
  setFieldValue(form, "input[name='imageUrl']", defaultValues?.imageUrl)
  setBackgroundImage(document, 'img#imageUrl', defaultValues?.imageUrl)
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

async function initRoleAccount(form, defaultValues) {
  if (!form) return
  const selectEl = form.querySelector("[name='roleID']")
  if (!selectEl) return
  try {
    showSpinner()
    const listRole = await roleApi.getAll()
    hideSpinner()
    if (listRole.length > 0) {
      listRole.forEach((role) => {
        const optionEl = document.createElement('option')
        optionEl.value = +role.id
        if (+optionEl.value === defaultValues.roleID) {
          optionEl.selected = 'selected'
        }
        optionEl.innerHTML = `${role.title}`
        selectEl.appendChild(optionEl)
      })
    }
  } catch (error) {
    console.log('failed to fetch data', error)
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
    password: yup.string().required('Không được để trống trường này'),
    imageUrl: yup.string().required('Không được để trống').url('Chọn một đường dẫn hợp lệ'),
  })
}

async function handleValidateForm(form, formValues) {
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

export async function renderInfoUser({ idForm, defaultValues, onSubmit }) {
  const form = document.getElementById(idForm)
  if (!form) return
  await initRoleAccount(form, defaultValues)
  initRandomImage(form)
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
