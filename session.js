const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)

let sessionMiddleware = null

function configureSession() {
  const connection = mongoose.connection
  let Store = new MongoStore({
    mongooseConnection: connection,
    collection: 'sessions'
  })

  sessionMiddleware = session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: Store,
    saveUninitialized: false,
    cookie: { maxAge: 20 * 60 * 1000 }
  })
}

function getSessionMiddleware() {
  if (!sessionMiddleware) {
    configureSession()
  }
  return sessionMiddleware
}

module.exports = { getSessionMiddleware }
