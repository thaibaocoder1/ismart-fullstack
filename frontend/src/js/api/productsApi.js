import axiosClient from './axiosClient'

const productApi = {
  getAll(params) {
    const url = '/products'
    return axiosClient.get(url, {
      params,
    })
  },
  getById(id) {
    const url = `/products/detail/${id}`
    return axiosClient.get(url)
  },
  getByCatalog(query) {
    const url = `/products/${query}`
    return axiosClient.get(url)
  },
  add(data) {
    const url = `/products`
    return axiosClient.post(url, data)
  },
  addFormData(data) {
    const url = `/products/add?_method=POST`
    return axiosClient.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  update(data) {
    const url = `/products/update-order/${data.id}?_method=PATCH`
    return axiosClient.patch(url, data)
  },
  updateFormData(data) {
    const url = `/products/update/${data.get('id')}?_method=PATCH`
    return axiosClient.patch(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  delete(id) {
    const url = `/products/${id}`
    return axiosClient.delete(url)
  },
}
export default productApi
