import commentApi from '../api/commentApi'
import { hideSpinner, initCommentForm, showSpinner, toast } from '../utils'

async function handleOnSubmitForm(formValues) {
  try {
    showSpinner()
    const updateComment = await commentApi.update(formValues)
    hideSpinner()
    if (updateComment) toast.success('Chỉnh sửa bình luận thành công')
    setTimeout(() => {
      window.location.assign('/admin/comment.html')
    }, 500)
  } catch (error) {
    toast.error('Có lỗi trong khi xử lý')
  }
}
// main
;(async () => {
  const searchParams = new URLSearchParams(location.search)
  const commentID = +searchParams.get('id')
  showSpinner()
  const defaultValues = await commentApi.getById(commentID)
  hideSpinner()
  if (commentID) {
    initCommentForm({
      idForm: 'formComment',
      defaultValues,
      onSubmit: handleOnSubmitForm,
    })
  }
})()
