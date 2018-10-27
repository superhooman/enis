export const changeLocale = () => ({
    type: 'CHANGE_LOCALE'
})

export const changeTheme = () => ({
    type: 'CHANGE_THEME'
})

export const login = (pin, password, city, journal, role) => ({
    type: 'LOGIN',
    pin,
    password,
    city,
    journal,
    role,
})

export const logout = () => ({
    type: 'LOGOUT'
})

export const notify = (text) => ({
    type: 'NOTIFY',
    text
})


export const dismissNotify = () => ({
    type: 'NOTIFY_DISMISS',
})

export const loadingStart = () => ({
    type: 'LOADING',
})

export const loadingStop = () => ({
    type: 'LOADING_STOP',
})
