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
    console.log(`✅ FFmpeg路径已设置: ${ffmpegPath}`)
  }
} catch (error) {
  // 如果找不到，fluent-ffmpeg会尝试使用系统PATH中的ffmpeg
  console.log('ℹ️ 使用系统PATH中的FFmpeg')
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

    console.log(`🎬 开始提取视频缩略图: ${videoPath}`)
    console.log(`📸 输出路径: ${outputPath}`)

    // 使用FFmpeg提取第一帧
    const ffmpegInstance = ffmpeg(videoPath)
    
    let stderrOutput = ''
    let hasError = false
    
    // 添加更多错误处理
    ffmpegInstance
      .screenshots({
        timestamps: ['00:00:00.000'], // 提取第一帧（0秒）
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '800x450', // 缩略图尺寸（16:9比例）
      })
      .on('start', (commandLine) => {
        console.log('FFmpeg命令:', commandLine)
      })
      .on('end', () => {
        // 等待一小段时间确保文件写入完成
        setTimeout(() => {
          // 再次检查文件是否存在
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath)
            if (stats.size > 0) {
              console.log(`✅ 视频缩略图提取成功: ${outputPath} (${stats.size} bytes)`)
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
        hasError = true
        console.error(`❌ 提取视频缩略图失败:`, err.message)
        console.error('错误详情:', err)
        console.error('FFmpeg输出:', stderrOutput)
        reject(new Error(`FFmpeg错误: ${err.message}. 输出: ${stderrOutput}`))
      })
      .on('stderr', (stderrLine) => {
        stderrOutput += stderrLine + '\n'
        // 输出FFmpeg的stderr信息（用于调试）
        if (stderrLine.includes('error') || stderrLine.includes('Error')) {
          console.warn('FFmpeg警告:', stderrLine.trim())
        }
      })
  })
}

/**
 * 检查FFmpeg是否可用
 * @returns {Promise<boolean>}
 */
export const checkFFmpegAvailable = () => {
  return new Promise((resolve) => {
    ffmpeg.getAvailableEncoders((err, encoders) => {
      if (err) {
        console.warn('⚠️ FFmpeg可能未安装或不可用:', err.message)
        resolve(false)
      } else {
        console.log('✅ FFmpeg可用')
        resolve(true)
      }
    })
  })
}

