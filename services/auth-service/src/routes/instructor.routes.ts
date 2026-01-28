import express, { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/authorize.js'
import { Role } from '../utils/roles.js'

const router = Router()
router.use(authenticate, authorize(Role.INSTRUCTOR))

router.get('/dashboard', (req, res) => {
    res.json({ message: 'Instructor Dashboard' })
})

export default router