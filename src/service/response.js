export const SendCreate = (res, message, data) => {
    res.status(201).json({ success: true, message, data }) //201 new data 
}
export const SendSuccess = (res, message, data) => {
    res.status(200).json({ success: true, message, data }) //200 OK
}
export const SendError = (res, status, message, error) => {
    res.status(status).json({ success: false, message, error, data: {} }) 
    // 400 BadRequest,401 uaunthorization ,500 Error Server Internal
}
