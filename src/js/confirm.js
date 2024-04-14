import userApi from './api/userApi'
import { hideSpinner, showSpinner } from './utils'

// main
;(async () => {
  const searchParams = new URLSearchParams(location.search)
  try {
    showSpinner()
    const confirm = await userApi.confirmRecovey(searchParams)
    hideSpinner()
    if (confirm.success) {
      toast.success(confirm.message)
      setTimeout(() => {
        window.location.assign('https://ismart-fullstack.vercel.app/login.html')
      }, 1000)
    } else {
      toast.error(confirm.message)
      return
    }
  } catch (error) {
    console.log(error)
  }
})()
