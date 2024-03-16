import axiosClient from './axiosClient'

const orderApi = {
  getAll() {
    const url = '/order'
    return axiosClient.get(url)
  },
  getById(id) {
    const url = `/order/${id}`
    return axiosClient.get(url)
  },
  add(data) {
    const url = `/order`
    return axiosClient.post(url, data)
  },
  update(data) {
    const url = `/order/${data.id}`
    return axiosClient.patch(url, data)
  },
  delete(id) {
    const url = `/order/${id}`
    return axiosClient.delete(url)
  },
}
export default orderApi
