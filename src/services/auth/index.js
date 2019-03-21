import restify from 'restify'
import errors from 'restify-errors'
import uniqid from 'uniqid'
import rjwt from 'restify-jwt-community'
import jwt from 'jsonwebtoken'
import cookie from  'cookie'
import restifyAsyncWrap from '../../helpers/async'
import CacheClient from '../../helpers/cache'
import KeycloakClient from '../../helpers/keycloak'
import validators from '../../helpers/validators'


const authService = {
    start: function( config ) {

        const logger = config.serviceLog
        const cache = new CacheClient( config.cacheConfig )
        logger.info('Caching Client Service Ready')
        const keycloak = new KeycloakClient( config.keycloakConfig )
        logger.info('Keycloak Client Service Ready')
        const server = restify.createServer( config.options )

        // JWT Exception List
        server.use( rjwt( config.jwt ).unless( {
            path: [
                {
                    methods: [ 'GET' ],
                    url: `${config.prefix}/health`
                },
                {
                    methods: [ 'POST' ],
                    url: `${config.prefix}`
                }
            ]
        } ) )

        // Login
        server.post( {
            path: `${config.prefix}`,
            validation: validators.login
        }, restifyAsyncWrap(async (req, res, next) => {
            const username = req.body.username
            try {
                const password = req.body.password
                const keycloakResponse = await keycloak.authenticate( username, password )
                const jsonReponse = JSON.parse(keycloakResponse)
                const accessToken = jsonReponse['access_token']
                const sessionState = jsonReponse['session_state']
                const expiresIn = jsonReponse['expires_in']
                const cacheKey = uniqid()
                const token = jwt.sign( {
                    uid: cacheKey
                }, config.jwt.secret, { expiresIn: `${expiresIn}s` } )
                const cacheData = {
                    auth: {
                        access_token: accessToken,
                        session_state: sessionState
                    },
                    acl: {}
                }
                const user = {
                    username
                }
                await cache.create(cacheKey, cacheData, expiresIn)
                logger.debug(`Login for ${username} using ${cacheKey}`)
                res.setHeader('Set-Cookie', cookie.serialize(config.jwt.requestProperty, token, {
                    httpOnly: true,
                    maxAge: expiresIn
                }));
                res.send({ user })
                return next()
            } catch (e) {
                logger.warning(`Login for ${username} ${e.toString()}`)
                return next( new errors.UnauthorizedError() )
            }
        }))

        // Logout
        server.del( `${config.prefix}`, restifyAsyncWrap(async (req, res, next) => {
            const cacheKey = req.jwt.uid
            try {
                await cache.delete(cacheKey)
                logger.debug(`Logout using ${cacheKey}`)
                res.setHeader('Set-Cookie', cookie.serialize(config.jwt.requestProperty, null, {
                    httpOnly: true,
                    maxAge: 0
                }));
                res.send( {} )
                return next()
            } catch (e) {
                logger.warning(`Logout using ${cacheKey} ${e.toString()}`)
                return next( new errors.InternalServerError() )
            }
        }) )

        logger.info('API Service Ready')

        return server
    }
}

module.exports = authService
