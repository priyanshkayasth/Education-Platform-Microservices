import express from 'express'
import { googleCallback, login, logout, me, register } from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/authenticate.js'
import passport from '../config/passport.js'


const router=express.Router()

router.get('/test', (req, res) => {
  res.send("AUTH ROUTE WORKING");
});


router.post('/register',register)
router.post('/login',login)

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  googleCallback
);

router.get('/me',authenticate,me)
router.post('/logout',logout)

export default router