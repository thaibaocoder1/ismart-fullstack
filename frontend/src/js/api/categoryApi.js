import axiosClient from './axiosClient'

const categoryApi = {
  getAll() {
    const url = '/catalogs'
    return axiosClient.get(url)
  },
  getById(id) {
    const url = `/catalogs/${id}`
    return axiosClient.get(url)
  },
  add(data) {
    const url = `/catalogs`
    return axiosClient.post(url, data)
  },
  update(data) {
    const url = `/catalogs/update/${data.id}?_method=PATCH`
    return axiosClient.patch(url, data)
  },
  delete(id) {
    const url = `/catalogs/${id}`
    return axiosClient.delete(url)
  },
}
export default categoryApi
