import axiosClient from './axiosClient'

const commentApi = {
  getAll() {
    const url = '/comments'
    return axiosClient.get(url)
  },
  getById(id) {
    const url = `/comments/${id}`
    return axiosClient.get(url)
  },
  add(data) {
    const url = `/comments/add`
    return axiosClient.post(url, data)
  },
  update(data) {
    const url = `/comments/${data.id}`
    return axiosClient.patch(url, data)
  },
  delete(id) {
    const url = `/comments/delete/${id}?_method=DELETE`
    return axiosClient.delete(url)
  },
}
export default commentApi
