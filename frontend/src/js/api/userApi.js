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
  verify(id) {
    const url = `/users/verify/${id}`
    return axiosClient.get(url)
  },
  add(data) {
    const url = `/users/add`
    return axiosClient.post(url, data)
  },
  update(data) {
    const url = `/users/update/${data.id}?_method=PATCH`
    return axiosClient.patch(url, data)
  },
  delete(id) {
    const url = `/users/${id}`
    return axiosClient.delete(url)
  },
}
export default userApi
