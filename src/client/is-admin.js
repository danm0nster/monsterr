let url = window.location
let isAdmin = url.pathname === '/admin'

if (isAdmin && url.search !== '?dan') {
  window.location.replace('/')
}

export default isAdmin
