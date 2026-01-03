import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image, Video, FileText, Eye, Download, Heart, Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import FileRename from './FileRename'

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取文件预览URL
const getPreviewUrl = (url) => {
  if (url.startsWith('http')) return url
  return url.startsWith('/') ? url : `/api/files${url}`
}

export default function FileList({ fileType = null, onFileClick, onDelete, onFilesLoaded, customFetch, albumId = null, searchQuery = '', enableSelection = false, selectedFiles = [], onSelectionChange }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [renamingFileId, setRenamingFileId] = useState(null)
  const [selectedIds, setSelectedIds] = useState(selectedFiles || [])

  // 获取文件列表
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let fileList = []
      
      if (customFetch) {
        // 使用自定义获取函数
        fileList = await customFetch()
      } else {
        // 标准获取方式
        let url = fileType
          ? `/api/files/type/${fileType}`
          : '/api/files'
        
        if (albumId) {
          url = `/api/albums/${albumId}`
        }
        
        // 添加搜索参数
        if (searchQuery) {
          url += `${url.includes('?') ? '&' : '?'}search=${encodeURIComponent(searchQuery)}`
        }
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`)
        }
        
        const data = await response.json()

        if (data.status === 'success') {
          if (albumId && data.data.album) {
            // 从相册获取文件
            fileList = data.data.album.files || []
          } else {
            fileList = data.data.files || []
          }
        } else {
          setError(data.message || '获取文件列表失败')
          return
        }
      }
      
      setFiles(fileList)
      if (onFilesLoaded) {
        onFilesLoaded(fileList)
      }
    } catch (err) {
      setError(`网络错误: ${err.message}，请检查后端服务是否启动`)
      console.error('获取文件列表失败:', err)
    } finally {
      setLoading(false)
    }
  }, [fileType, albumId, searchQuery, customFetch, onFilesLoaded])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // 切换收藏
  const toggleFavorite = async (fileId, currentFavorite) => {
    try {
      const response = await fetch(`/api/files/${fileId}/favorite`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.status === 'success') {
        setFiles((prev) =>
          prev.map((f) =>
            (f._id === fileId || f.id === fileId)
              ? { ...f, isFavorite: data.data.isFavorite }
              : f
          )
        )
      }
    } catch (err) {
      console.error('操作失败:', err)
    }
  }

  // 删除文件
  const handleDelete = async (fileId) => {
    if (!confirm('确定要删除这个文件吗？')) return

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.status === 'success') {
        const updatedFiles = files.filter((f) => (f._id !== fileId && f.id !== fileId))
        setFiles(updatedFiles)
        if (onFilesLoaded) {
          onFilesLoaded(updatedFiles)
        }
        if (onDelete) onDelete(fileId)
      } else {
        alert(data.message || '删除失败')
      }
    } catch (err) {
      console.error('删除失败:', err)
      alert('删除失败，请稍后重试')
    }
  }

  // 下载文件
  const handleDownload = (file) => {
    const url = getPreviewUrl(file.url)
    const downloadUrl = `${url}?download=true`
    window.open(downloadUrl, '_blank')
  }

  // 重命名文件
  const handleRename = (updatedFile) => {
    setFiles((prev) =>
      prev.map((f) => (f._id === updatedFile._id ? updatedFile : f))
    )
    if (onFilesLoaded) {
      const updatedFiles = files.map((f) => (f._id === updatedFile._id ? updatedFile : f))
      onFilesLoaded(updatedFiles)
    }
    setRenamingFileId(null)
  }

  // 开始重命名
  const startRename = (fileId) => {
    setRenamingFileId(fileId)
  }

  // 处理选择
  const handleSelect = (fileId, e) => {
    if (!enableSelection) return
    e.stopPropagation()
    setSelectedIds(prev => {
      const newSelection = prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
      if (onSelectionChange) {
        onSelectionChange(newSelection)
      }
      return newSelection
    })
  }

  // 同步外部选择状态
  useEffect(() => {
    if (selectedFiles && Array.isArray(selectedFiles)) {
      // 只有当selectedFiles真正变化时才更新（深度比较）
      const currentIdsStr = JSON.stringify(selectedIds.sort())
      const newIdsStr = JSON.stringify([...selectedFiles].sort())
      if (currentIdsStr !== newIdsStr) {
        setSelectedIds(selectedFiles)
      }
    }
  }, [selectedFiles])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchFiles} className="mt-4" variant="outline">
          重试
        </Button>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无文件</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => {
        // 对于视频文件，优先使用 thumbnailUrl，如果没有则使用默认封面
        let previewUrl
        if (file.type === 'video') {
          previewUrl = file.thumbnailUrl 
            ? getPreviewUrl(file.thumbnailUrl) 
            : '/api/files/preview/default-video-cover.svg'
        } else {
          previewUrl = getPreviewUrl(file.thumbnailUrl || file.url)
        }
        const isPhoto = file.type === 'photo'
        const isVideo = file.type === 'video'
        const isDocument = file.type === 'document'
        const isSelected = selectedIds.includes(file._id || file.id)

        return (
          <Card
            key={file._id || file.id}
            className={cn(
              "group hover:shadow-lg transition-shadow cursor-pointer",
              enableSelection && isSelected && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => !enableSelection && onFileClick && onFileClick(file)}
          >
            <CardContent className="p-0">
              {/* 选择复选框 */}
              {enableSelection && (
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelect(file._id || file.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
              )}
              {/* 缩略图/预览 */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                {isPhoto && (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                {isVideo && (
                  <div className="w-full h-full relative bg-black/50">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // 如果图片加载失败，隐藏图片并显示fallback
                          e.target.style.display = 'none'
                          const parent = e.target.parentElement
                          if (parent) {
                            const fallback = parent.querySelector('.video-fallback')
                            if (fallback) {
                              fallback.style.display = 'flex'
                            }
                          }
                        }}
                      />
                    ) : null}
                    {/* 视频播放图标覆盖层（fallback时显示） */}
                    <div className={`video-fallback absolute inset-0 flex items-center justify-center ${previewUrl ? 'hidden' : 'flex'}`}>
                      <div className="bg-black/30 rounded-full p-3">
                        <Video className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                {isDocument && (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* 操作按钮（悬停显示，多选模式下隐藏） */}
                {!enableSelection && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileClick && onFileClick(file)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(file)
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* 收藏按钮（多选模式下隐藏） */}
                {!enableSelection && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(file._id || file.id, file.isFavorite)
                    }}
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4',
                        file.isFavorite
                          ? 'fill-red-500 text-red-500'
                          : 'text-white'
                      )}
                    />
                  </Button>
                )}
              </div>

              {/* 文件信息 */}
              <div className="p-4">
                {renamingFileId === (file._id || file.id) ? (
                  <FileRename
                    file={file}
                    onRename={handleRename}
                    onCancel={() => setRenamingFileId(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-sm truncate flex-1" title={file.name}>
                        {file.name}
                      </h3>
                      {!enableSelection && (
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              startRename(file._id || file.id)
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(file._id || file.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>·</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

