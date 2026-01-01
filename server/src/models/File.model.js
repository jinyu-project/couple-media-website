import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['photo', 'video', 'document'],
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  description: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isFavorite: {
    type: Boolean,
    default: false,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
  },
  // 视频/照片特有字段
  duration: {
    type: Number, // 视频时长（秒）
  },
  width: {
    type: Number, // 图片/视频宽度
  },
  height: {
    type: Number, // 图片/视频高度
  },
  // 文档特有字段
  pageCount: {
    type: Number, // PDF 页数
  },
}, {
  timestamps: true,
})

// 索引
fileSchema.index({ type: 1 })
fileSchema.index({ uploadedBy: 1 })
fileSchema.index({ albumId: 1 })
fileSchema.index({ isFavorite: 1 })
fileSchema.index({ createdAt: -1 })

const File = mongoose.model('File', fileSchema)

export default File

