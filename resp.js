module.exports.new = (success, statusCode, err_or_res) => {
    const resp = {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
    }
    const body = {
        success,
    }
    if (!success) {
        body.error = err_or_res
    }else{
        body.result = err_or_res
    }
    resp.body = JSON.stringify(body)
    return resp
}

module.exports.redirect = (code, url) => {
    return {
        statusCode: code,
        headers: {
            'Location': url
        }
    }
}
