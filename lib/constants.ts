export const Roles = Object.freeze({
    ADMIN: "admin",
    MODERATOR : "moderator"
})

export const AUTH_STATUS = Object.freeze({
    SIGNUP: "SIGNUP",
    SIGNIN : "SIGNIN",
    INVALID_GRANT: 400,
    USER_ALREADY_EXISTS: 422
})

export const USER_NETWORK_STATUS = Object.freeze({
    ONLINE: "ONLINE",
    OFFLINE : "OFFLINE",
})