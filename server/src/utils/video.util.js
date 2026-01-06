import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 尝试设置FFmpeg路径（Windows系统）
try {
  // Windows下，winget安装的FFmpeg通常在用户目录下
  const ffmpegPath = execSync('where ffmpeg', { encoding: 'utf-8' }).trim().split('\n')[0]
  if (ffmpegPath && fs.existsSync(ffmpegPath)) {
    ffmpeg.setFfmpegPath(ffmpegPath)
  }
} catch (error) {
  // 如果找不到，fluent-ffmpeg会尝试使用系统PATH中的ffmpeg
}

/**
 * 从视频文件提取第一帧作为缩略图
 * @param {string} videoPath - 视频文件路径
 * @param {string} outputPath - 输出缩略图路径（可选，不提供则自动生成）
 * @returns {Promise<string>} - 返回缩略图文件路径
 */
export const extractVideoThumbnail = (videoPath, outputPath = null) => {
  return new Promise((resolve, reject) => {
    // 检查视频文件是否存在
    if (!fs.existsSync(videoPath)) {
      return reject(new Error('视频文件不存在'))
    }

    // 如果没有指定输出路径，自动生成
    if (!outputPath) {
      const videoDir = path.dirname(videoPath)
      const videoName = path.basename(videoPath, path.extname(videoPath))
      outputPath = path.join(videoDir, `${videoName}-thumb.jpg`)
    }

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }


    // 先获取视频信息以确定宽高比
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.warn('⚠️ 无法获取视频信息，使用默认横版尺寸:', err.message)
        // 如果无法获取视频信息，使用横版尺寸
        extractThumbnailWithSize(videoPath, outputPath, '400x225', resolve, reject)
        return
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video')
      if (!videoStream) {
        console.warn('⚠️ 未找到视频流，使用默认横版尺寸')
        extractThumbnailWithSize(videoPath, outputPath, '400x225', resolve, reject)
        return
      }

      const width = videoStream.width
      const height = videoStream.height
      
      // 统一使用横版缩略图，尺寸更小（16:9比例）
      const thumbnailSize = '400x225'

      extractThumbnailWithSize(videoPath, outputPath, thumbnailSize, resolve, reject)
    })
  })
}

// 提取缩略图的辅助函数
const extractThumbnailWithSize = (videoPath, outputPath, thumbnailSize, resolve, reject) => {
    const ffmpegInstance = ffmpeg(videoPath)
    
    let stderrOutput = ''
    
    // 添加更多错误处理
    ffmpegInstance
      .screenshots({
        timestamps: ['00:00:00.000'], // 提取第一帧（0秒）
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: thumbnailSize, // 根据视频方向使用不同尺寸
      })
      .on('end', () => {
        // 等待一小段时间确保文件写入完成
        setTimeout(() => {
          // 再次检查文件是否存在
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath)
            if (stats.size > 0) {
              resolve(outputPath)
            } else {
              reject(new Error(`缩略图文件为空: ${outputPath}`))
            }
          } else {
            reject(new Error(`缩略图文件未生成: ${outputPath}. FFmpeg输出: ${stderrOutput}`))
          }
        }, 1000) // 等待1秒
      })
      .on('error', (err) => {
        console.error('提取视频缩略图失败:', err.message)
        reject(new Error(`FFmpeg错误: ${err.message}. 输出: ${stderrOutput}`))
      })
      .on('stderr', (stderrLine) => {
        stderrOutput += stderrLine + '\n'
      })
}

