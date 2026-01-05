import express from 'express'
import * as novelController from '../controllers/novel.controller.js'
import * as chapterController from '../controllers/chapter.controller.js'
import { upload, validateFileSize } from '../middleware/upload.middleware.js'

const router = express.Router()

// 章节路由（需要在小说路由之前定义，避免被/:id匹配）
router.post('/:novelId/chapters', chapterController.createChapter)
router.get('/:novelId/chapters', chapterController.getChaptersByNovel)
router.get('/:novelId/chapters/:id', chapterController.getChapterById)
router.put('/:novelId/chapters/:id', chapterController.updateChapter)
router.delete('/:novelId/chapters/:id', chapterController.deleteChapter)
router.put('/:novelId/chapters/order', chapterController.updateChapterOrder)

// 小说路由
router.post('/', novelController.createNovel)
router.get('/', novelController.getNovels)
router.get('/:id', novelController.getNovelById)
router.put('/:id', novelController.updateNovel)
router.delete('/:id', novelController.deleteNovel)

export default router

