import userApi from '../api/userApi'
import roleApi from '../api/roleApi'
import { hideSpinner, setBackgroundImage, setFieldValue, showSpinner } from '../utils'
function setFormValues(form, infoUser) {
  setFieldValue(form, "[name='fullname']", infoUser?.fullname)
  setFieldValue(form, "[name='username']", infoUser?.username)
  setFieldValue(form, "[name='email']", infoUser?.email)
  setFieldValue(form, "[name='phone']", infoUser?.phone)
  setBackgroundImage(document, 'img#imageUrl', infoUser?.imageUrl)
}

async function registerInfoAccountAdmin({ idForm, idAccount }) {
  const form = document.getElementById(idForm)
  if (!form) return
  try {
    showSpinner()
    const infoUser = await userApi.getById(idAccount)
    hideSpinner()
    setFormValues(form, infoUser)
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
      if (+role.id === idAccount) {
        element.value = `${role.title}`
      }
    })
  } catch (error) {
    console.log('failed to fetch data', error)
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
    })
    renderRoles({
      idElement: 'role',
      idAccount: isHasAdmin.user_id,
    })
  }
})()
