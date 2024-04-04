import axiosClient from './axiosClient'

const userApi = {
  getAll() {
    const url = '/users'
    return axiosClient.get(url)
  },
  getById(id) {
    const url = `/users/${id}`
    return axiosClient.get(url)
  },
  check(data) {
    const url = `/users/login`
    return axiosClient.post(url, data)
  },
  active(id) {
    const url = `/users/active/${id}`
    return axiosClient.post(url)
  },
  forgot(data) {
    const url = `/users/forgot`
    return axiosClient.post(url, data)
  },
  verify(id) {
    const url = `/users/verify/${id}`
    return axiosClient.get(url)
  },
  logout() {
    const url = `/users/logout`
    return axiosClient.get(url)
  },
  add(data) {
    const url = `/users/add`
    return axiosClient.post(url, data)
  },
  addFormData(data) {
    const url = `/users/add/form`
    return axiosClient.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  update(data) {
    const url = `/users/update/${data.id}?_method=PATCH`
    return axiosClient.patch(url, data)
  },
  updateFields(data) {
    const url = `/users/update-field/${data.id}?_method=PATCH`
    return axiosClient.patch(url, data)
  },
  updateFormData(data) {
    const url = `/users/update/${data.get('id')}?_method=PATCH`
    return axiosClient.patch(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  delete(id) {
    const url = `/users/delete/${id}?_method=DELETE`
    return axiosClient.delete(url)
  },
  restore(id) {
    const url = `/users/restore/${id}?_method=PATCH`
    return axiosClient.patch(url)
  },
  reset(data) {
    const url = `/users/reset/${data.id}?_method=PATCH`
    return axiosClient.patch(url, data)
  },
}
export default userApi
