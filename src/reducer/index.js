const parseUser = () =>{
    let res 
    try{
        res = JSON.parse(localStorage.getItem("user"))
    } catch(err) {
        res = null
    }
    return res
}

const initialState = {
    locale: parseInt(localStorage.getItem("locale"), 10) < 4 ? parseInt(localStorage.getItem("locale"), 10) : 0,
    theme: parseInt(localStorage.getItem("theme"), 2) || 0,
    journal: localStorage.getItem("user") ? parseUser().journal : 'jko',
    user: localStorage.getItem("user") ? parseUser() : null,
    logged: parseUser() ? parseInt(localStorage.getItem("logged"), 2) : 0,
    city: localStorage.getItem("city"),
    message: {
        text: "",
        show: false
    },
    achievement: false
}

if (initialState.theme) {
    document.body.classList.add('dark')
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'CHANGE_LOCALE':
            let newLocale
            if (state.locale === 0) {
                newLocale = 1
            } else if (state.locale === 1) {
                newLocale = 2
            } else {
                newLocale = 0
            }
            localStorage.setItem("locale", newLocale)
            return {
                ...state,
                locale: newLocale
            }
        case 'CHANGE_THEME':
            document.body.classList.toggle('dark')
            let theme = state.theme === 0 ? 1 : 0
            localStorage.setItem("theme", theme)
            return {
                ...state,
                theme: theme
            }
        case 'LOGIN':
            let user = {
                journal: action.journal,
                pin: action.pin,
                password: action.password,
                city: action.city,
                role: action.role,
            }
            localStorage.setItem("user", JSON.stringify(user))
            localStorage.setItem("city", action.city)
            localStorage.setItem("logged", 1)
            return {
                ...state,
                user: user,
                city: action.city,
                logged: true
            }
        case 'LOGOUT':
            localStorage.setItem("user", "")
            localStorage.setItem("logged", "")
            return {
                ...state,
                logged: 0,
                user: null
            }
        case 'NOTIFY':
            return {
                ...state,
                message: {
                    text: action.text,
                    show: true
                }
            }
        case 'NOTIFY_DISMISS':
            return {
                ...state,
                message: {
                    text: state.message.text,
                    show: false
                }
            }
        case 'LOADING':
            return {
                ...state,
                loading: true
            }
        case 'LOADING_STOP':
            return {
                ...state,
                loading: false
            }
        default:
            return state
    }
}

export default reducer