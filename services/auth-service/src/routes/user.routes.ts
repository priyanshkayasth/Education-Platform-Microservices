import express, { Router } from 'express'
import { awardReferralPoints, deductPoints, getUserById } from '../controllers/user.controller.js'

const app=Router()

app.patch('/referral/award-points', awardReferralPoints) 
app.patch('/deduct-points', deductPoints); // 
app.get('/:id',getUserById)




export default app