import express from 'express'
import { login, logout, me, register } from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/authenticate.js'

const router=express.Router()

router.post('/register',register)
router.post('/login',login)
router.get('/me',authenticate,me)
router.post('/logout',logout)

export default router