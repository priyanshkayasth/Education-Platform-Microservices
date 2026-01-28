import express, { Router } from 'express'
import { getUserById } from '../controllers/user.controller.js'

const app=Router()

app.get('/:id',getUserById)


export default app