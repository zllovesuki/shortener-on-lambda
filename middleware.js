const resp = require('./resp')

const DOMAIN = process.env.ALLOWED_DOMAIN

module.exports.auth = async(evt, ctx) => {
    const claims = evt.requestContext.authorizer.claims
    if (!claims.email.endsWith(DOMAIN)) {
        ctx.end()
        return resp.new(false, 403, `This URL shortener is only for use with ${DOMAIN} email addresses.`)
    }
    return claims.email
}
