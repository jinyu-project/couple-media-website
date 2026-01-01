import mongoose from 'mongoose'

const albumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String, // 封面图片URL
  },
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
})

// 索引
albumSchema.index({ createdBy: 1 })
albumSchema.index({ createdAt: -1 })

const Album = mongoose.model('Album', albumSchema)

export default Album

