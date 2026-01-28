import * as dotenv from 'dotenv'
dotenv.config()

export const envconfig = {
    port: process.env.PORT || 3000,
    jwt: {
        secret: process.env.JWT_SECRET || 'default_jwt_secret'

    }
}