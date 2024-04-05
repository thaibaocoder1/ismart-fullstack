import userApi from '../../../src/js/api/userApi'
import { hideSpinner, setBackgroundImage, setFieldValue, showSpinner } from '../../../src/js/utils'
function setFormValues(form, infoUser) {
  setFieldValue(form, "[name='fullname']", infoUser?.fullname)
  setFieldValue(form, "[name='username']", infoUser?.username)
  setFieldValue(form, "[name='email']", infoUser?.email)
  setFieldValue(form, "[name='phone']", infoUser?.phone)
  setFieldValue(form, "[name='role']", infoUser?.role)
  setBackgroundImage(document, 'img#imageUrl', infoUser?.imageUrl)
}

async function registerInfoAccountAdmin({ idForm, idAccount }) {
  const form = document.getElementById(idForm)
  if (!form) return
  try {
    showSpinner()
    const res = await userApi.getById(idAccount)
    hideSpinner()
    if (res.success) {
      const { user } = res
      setFormValues(form, user)
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}

// main
;(() => {
  const userInfoStorage = JSON.parse(localStorage.getItem('accessTokenAdmin'))
  if (userInfoStorage) {
    registerInfoAccountAdmin({
      idForm: 'formAccountAdmin',
      idAccount: userInfoStorage.id,
    })
  }
  console.log(123)
})()
