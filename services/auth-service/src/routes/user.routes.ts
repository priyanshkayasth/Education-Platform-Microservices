import express, { Router } from 'express'
import { awardReferralPoints, changePassword, deductPoints, getUserById } from '../controllers/user.controller.js'
import { authenticate } from '../middlewares/authenticate.js';

const app=Router()

app.patch('/referral/award-points', awardReferralPoints) 
app.patch('/deduct-points', deductPoints); // 
app.patch('/change-password', authenticate, changePassword) 

app.get('/:id',getUserById)




export default app