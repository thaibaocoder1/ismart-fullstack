export function registerShowHidePassword({ selector }) {
  const toggleWrapper = document.querySelectorAll(selector)
  if (!toggleWrapper) return
  ;[...toggleWrapper].forEach((toggle) => {
    toggle.addEventListener('click', function () {
      const input = this.parentElement.querySelector('.password')
      input?.setAttribute('type', `${input.type === 'password' ? 'text' : 'password'}`)
      const listIcon = this.children
      Array.from(listIcon).forEach((icon) => icon.classList.toggle('is-active'))
    })
  })
}
