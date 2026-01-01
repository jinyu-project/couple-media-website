import express from 'express'
import * as userController from '../controllers/user.controller.js'

const router = express.Router()

// 获取当前用户信息
router.get('/me', userController.getCurrentUser)

// 更新用户信息
router.put('/me', userController.updateUser)

// 获取用户列表（管理员）
router.get('/', userController.getUsers)

// 根据ID获取用户信息
router.get('/:id', userController.getUserById)

export default router

