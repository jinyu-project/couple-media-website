import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight, Download, Heart, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import FileRename from './FileRename'

// 获取文件预览URL
const getPreviewUrl = (url) => {
  if (url.startsWith('http')) return url
  return url.startsWith('/') ? url : `/api/files${url}`
}

export default function FilePreview({ file, files = [], onClose, onNext, onPrev, onToggleFavorite, onFileUpdate }) {
  const [isFavorite, setIsFavorite] = useState(file?.isFavorite || false)
  const [videoRef, setVideoRef] = useState(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [currentFile, setCurrentFile] = useState(file)

  useEffect(() => {
    setIsFavorite(file?.isFavorite || false)
    setCurrentFile(file)
  }, [file])

  if (!file) return null

  const isPhoto = file.type === 'photo'
  const isVideo = file.type === 'video'
  const isDocument = file.type === 'document'
  const previewUrl = getPreviewUrl(file.url)

  // 切换收藏
  const handleToggleFavorite = async () => {
    try {
      const response = await fetch(`/api/files/${file._id}/favorite`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.status === 'success') {
        setIsFavorite(data.data.isFavorite)
        if (onToggleFavorite) {
          onToggleFavorite(file._id, data.data.isFavorite)
        }
      }
    } catch (err) {
      console.error('操作失败:', err)
    }
  }

  // 下载文件
  const handleDownload = () => {
    const downloadUrl = `${previewUrl}?download=true`
    window.open(downloadUrl, '_blank')
  }

  // 重命名文件
  const handleRename = (updatedFile) => {
    setCurrentFile(updatedFile)
    setIsRenaming(false)
    if (onFileUpdate) {
      onFileUpdate(updatedFile)
    }
  }

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev()
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onPrev, onNext])

  const currentIndex = files.findIndex((f) => f._id === file._id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < files.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* 关闭按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* 操作按钮 */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleToggleFavorite}
        >
          <Heart
            className={cn(
              'h-5 w-5',
              isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
            )}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => setIsRenaming(true)}
        >
          <Pencil className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleDownload}
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* 导航按钮 */}
      {hasPrev && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 text-white hover:bg-white/20"
          onClick={onPrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}
      {hasNext && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 text-white hover:bg-white/20"
          onClick={onNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* 内容区域 */}
      <div className="max-w-7xl max-h-[90vh] w-full px-16 py-20 flex items-center justify-center">
        {isPhoto && (
          <img
            src={previewUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {isVideo && (
          <video
            ref={setVideoRef}
            src={previewUrl}
            controls
            className="max-w-full max-h-full"
            autoPlay
          />
        )}

        {isDocument && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {file.mimeType === 'application/pdf' ? (
              <iframe
                src={previewUrl}
                className="w-full h-full min-h-[600px] border-0"
                title={file.name}
              />
            ) : (
              <div className="text-center text-white space-y-4">
                <p className="text-lg">该文档类型不支持在线预览</p>
                <Button onClick={handleDownload} variant="secondary">
                  <Download className="h-4 w-4 mr-2" />
                  下载文件
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 文件信息 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center min-w-[300px]">
        {isRenaming ? (
          <div className="bg-black/80 rounded-lg p-4">
            <FileRename
              file={currentFile}
              onRename={handleRename}
              onCancel={() => setIsRenaming(false)}
            />
          </div>
        ) : (
          <>
            <p className="font-medium">{currentFile?.name || file.name}</p>
            {files.length > 1 && (
              <p className="text-sm text-white/70 mt-1">
                {currentIndex + 1} / {files.length}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
