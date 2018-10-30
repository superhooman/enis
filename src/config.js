let config
let isDev
try {
    isDev = process.env.NODE_ENV === 'development'
} catch (err) {
    isDev = false
}
if (isDev) {
    config = {
        "server": "http://localhost:3003/"
    }
} else {
    config = {
        "server": "https://10.17.24.96:3003/" //For test
    }
}
export default config