const config = {
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    },
    server: {
        port: parseInt(process.env.PORT) || 3000,
        nodeEnv: process.env.NODE_ENV
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    },
    security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS),
  },
}


module.exports = config;