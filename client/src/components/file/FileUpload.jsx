import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, File, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// 文件类型和大小限制
const FILE_LIMITS = {
  photo: {
    types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 50 * 1024 * 1024, // 50MB
    label: '照片',
  },
  video: {
    types: ['video/mp4', 'video/quicktime', 'video/webm'],
    maxSize: 100 * 1024 * 1024, // 100MB
    label: '视频',
  },
  document: {
    types: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
    label: '文档',
  },
}

// 获取文件类型
const getFileType = (file) => {
  for (const [type, config] of Object.entries(FILE_LIMITS)) {
    if (config.types.includes(file.type)) {
      return type
    }
  }
  return null
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export default function FileUpload({ onUploadSuccess, fileType = null }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const uploadProgressRef = useRef({})

  // 验证文件
  const validateFile = (file) => {
    const type = getFileType(file)
    if (!type) {
      return { valid: false, error: '不支持的文件类型' }
    }

    if (fileType && type !== fileType) {
      return { valid: false, error: `请上传${FILE_LIMITS[fileType].label}文件` }
    }

    const limit = FILE_LIMITS[type]
    if (file.size > limit.maxSize) {
      return {
        valid: false,
        error: `${limit.label}文件大小不能超过${formatFileSize(limit.maxSize)}`,
      }
    }

    return { valid: true, type }
  }

  // 添加文件
  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles)
    const validFiles = []

    fileArray.forEach((file) => {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push({
          id: Date.now() + Math.random(),
          file,
          type: validation.type,
          name: file.name,
          size: file.size,
          status: 'pending', // pending, uploading, success, error
          progress: 0,
          error: null,
        })
      } else {
        alert(`${file.name}: ${validation.error}`)
      }
    })

    setFiles((prev) => [...prev, ...validFiles])
  }, [fileType])

  // 删除文件
  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  // 上传文件
  const uploadFile = async (fileItem) => {
    const formData = new FormData()
    formData.append('file', fileItem.file)

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          uploadProgressRef.current[fileItem.id] = progress
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id ? { ...f, progress } : f
            )
          )
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText)
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? { ...f, status: 'success', progress: 100 }
                  : f
              )
            )
            resolve(response.data.file)
          } catch (parseError) {
            console.error('解析响应失败:', parseError, xhr.responseText)
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? { ...f, status: 'error', error: '服务器响应格式错误' }
                  : f
              )
            )
            reject(new Error('服务器响应格式错误'))
          }
        } else {
          try {
            const error = xhr.responseText ? JSON.parse(xhr.responseText) : { message: `服务器错误: ${xhr.status}` }
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? { ...f, status: 'error', error: error.message || `上传失败 (${xhr.status})` }
                  : f
              )
            )
            reject(error)
          } catch (parseError) {
            console.error('解析错误响应失败:', parseError, xhr.responseText)
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? { ...f, status: 'error', error: `上传失败 (${xhr.status})` }
                  : f
              )
            )
            reject(new Error(`上传失败: ${xhr.status}`))
          }
        }
      })

      xhr.addEventListener('error', (e) => {
        console.error('XHR 错误:', e)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: 'error', error: '网络错误，请检查服务器连接' }
              : f
          )
        )
        reject(new Error('网络错误'))
      })

      xhr.addEventListener('abort', () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: 'error', error: '上传已取消' }
              : f
          )
        )
        reject(new Error('上传已取消'))
      })

      xhr.open('POST', '/api/files/upload')
      xhr.send(formData)
    })
  }

  // 上传所有文件
  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setUploading(true)
    let successCount = 0

    try {
      for (const fileItem of pendingFiles) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'uploading' } : f
          )
        )

        try {
          const uploadedFile = await uploadFile(fileItem)
          successCount++
          if (onUploadSuccess) {
            onUploadSuccess(uploadedFile)
          }
        } catch (error) {
          console.error('上传失败:', error)
        }
      }
    } finally {
      setUploading(false)
      // 如果有成功上传的文件，延迟清除以便用户看到成功状态
      if (successCount > 0) {
        setTimeout(() => {
          setFiles((prev) => prev.filter((f) => f.status === 'pending' || f.status === 'uploading'))
        }, 2000)
      } else {
        // 如果全部失败，不清除，让用户看到错误信息
      }
    }
  }

  // 拖拽处理
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  // 文件选择
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
    // 重置input，允许重复选择同一文件
    e.target.value = ''
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const uploadingCount = files.filter((f) => f.status === 'uploading').length

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              'cursor-pointer'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              拖拽文件到此处或点击上传
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {fileType
                ? `支持${FILE_LIMITS[fileType].label}文件，最大${formatFileSize(FILE_LIMITS[fileType].maxSize)}`
                : '支持照片、视频、文档等多种格式'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept={
                fileType
                  ? FILE_LIMITS[fileType].types.join(',')
                  : Object.values(FILE_LIMITS)
                      .flatMap((l) => l.types)
                      .join(',')
              }
            />
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">待上传文件 ({pendingCount})</h3>
                {pendingCount > 0 && (
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || pendingCount === 0}
                  >
                    {uploading ? `上传中 (${uploadingCount})...` : '开始上传'}
                  </Button>
                )}
              </div>

              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fileItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(fileItem.size)} · {FILE_LIMITS[fileItem.type].label}
                    </p>
                    {fileItem.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${fileItem.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {fileItem.progress}%
                        </p>
                      </div>
                    )}
                    {fileItem.status === 'success' && (
                      <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        上传成功
                      </p>
                    )}
                    {fileItem.status === 'error' && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fileItem.error}
                      </p>
                    )}
                  </div>
                  {(fileItem.status === 'pending' || fileItem.status === 'error') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(fileItem.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
