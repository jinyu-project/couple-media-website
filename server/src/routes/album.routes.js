import express from 'express'
import * as albumController from '../controllers/album.controller.js'

const router = express.Router()

// 创建相册
router.post('/', albumController.createAlbum)

// 获取所有相册
router.get('/', albumController.getAlbums)

// 获取相册详情
router.get('/:id', albumController.getAlbumById)

// 更新相册信息
router.put('/:id', albumController.updateAlbum)

// 删除相册
router.delete('/:id', albumController.deleteAlbum)

// 向相册添加文件
router.post('/:id/files', albumController.addFileToAlbum)

// 从相册移除文件
router.delete('/:id/files/:fileId', albumController.removeFileFromAlbum)

export default router

