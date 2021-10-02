'use strict';

const TABLE = process.env.DYNAMODB_TABLE
const DOMAIN = process.env.ALLOWED_DOMAIN
const WHERE = process.env.BOUND_DOMAIN

const AWS = require('aws-sdk')
const resp = require('./resp')
const util = require('./util')
const crypto = require('crypto')

const ddb = new AWS.DynamoDB.DocumentClient()

module.exports.debug = async (evt, ctx) => {
    return resp.new(true, 200, {evtCtx: evt, ctx})
}

module.exports.redirect = async (evt) => {
    const shortStr = evt.pathParameters.short

    if (!shortStr) {
        return resp.new(false, 400, "Short string cannot be empty.")
    }

    const params = {
        TableName: TABLE,
        Key: {
            shortStr
        }
    }

    try {
        const result = await ddb.get(params).promise()
        if (result.Item) {
            return resp.redirect(301, result.Item.longURL)
        }else{
            return resp.new(false, 404, "No short URL found with given short string.")
        }
    } catch(e) {
        return resp.new(false, 500, `Unable to redirect from short URL: ${e.message}`)
    }
}

function randomStr(length) {
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

module.exports.create = async (evt, ctx) => {
    const req = ((raw) => {
        try {
            return JSON.parse(raw)
        } catch(e) {
            return false
        }
    })(evt.body)

    if (!req) {
        return resp.new(false, 400, 'Cannot parse body as JSON.')
    }

    if (!util.isValidUrl(req.url)) {
        return resp.new(false, 400, 'URL is not valid.')
    }

    const timestamp = new Date().getTime();
    const params = {
        TableName: TABLE,
        Item: {
            shortStr: randomStr(8),
            longURL: req.url,
            userId: ctx.prev,
            createdAt: timestamp,
        }
    }

    try {
        await ddb.put(params).promise()
        return resp.new(true, 200, `https://${WHERE}/${params.Item.shortStr}`)
    } catch(e) {
        return resp.new(false, 500, `Unable to create short URL: ${e.message}`)
    }
}

module.exports.list = async (evt, ctx) => {
    let ts = new Date().getTime()
    if (!!evt.queryStringParameters && !!evt.queryStringParameters.earliest) {
        ts = parseInt(evt.queryStringParameters.earliest)
        if (isNaN(ts)) {
            return resp.new(false, 400, "Earliest cursor is not a number.")
        }
    }

    const params = {
        TableName: TABLE,
        IndexName: 'userId-createdAt-index',
        KeyConditionExpression: "userId = :v_user AND createdAt < :v_ts",
        ExpressionAttributeValues: {
            ":v_user": ctx.prev,
            ":v_ts": ts
        },
        ProjectionExpression: "shortStr, longURL, createdAt",
        Limit: 10
    }
    try {
        const result = await ddb.query(params).promise()
        result.Items.sort((a, b) => b.createdAt - a.createdAt)
        return resp.new(true, 200,  result.Items)
    } catch(e) {
        return resp.new(false, 500, `Unable to list short URLs: ${e.message}`)
    }
}

module.exports.delete = async (evt, ctx) => {
    const shortStr = evt.pathParameters.short

    if (!shortStr) {
        return resp.new(false, 400, "Short string cannot be empty.")
    }

    const params = {
        TableName: TABLE,
        Key: {
            shortStr
        },
        ConditionExpression: "userId = :v_user",
        ExpressionAttributeValues: {
            ":v_user": ctx.prev
        }
    }

    try {
        await ddb.delete(params).promise()
        return resp.new(true, 200, "Short URL deleted.")
    } catch(e) {
        return resp.new(false, 500, `Unable to delete short URL: ${e.message}`)
    }
}
