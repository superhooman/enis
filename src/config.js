let config
let isDev
try {
    isDev = process.env.NODE_ENV === 'development'
} catch (err) {
    isDev = false
}
if (isDev) {
    config = {
        "server": "http://localhost:3003/",
        "captcha": "http://localhost:8080"
    }
} else {
    config = {
        "server": window.location.host === "nisapp.kz" ? 'https://api.nisapp.kz' : (window.location.origin + ':3003'),
        "captcha": "http://pvl.nis.edu.kz/captcha.html"
    }
}
export default config