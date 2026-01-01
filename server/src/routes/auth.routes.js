import express from 'express'
import * as authController from '../controllers/auth.controller.js'

const router = express.Router()

// 用户注册
router.post('/register', authController.register)

// 用户登录
router.post('/login', authController.login)

// 用户登出
router.post('/logout', authController.logout)

// 刷新令牌
router.post('/refresh', authController.refreshToken)

export default router

