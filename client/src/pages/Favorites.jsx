import { useState } from 'react'
import FileList from '@/components/file/FileList'
import FilePreview from '@/components/file/FilePreview'

export default function Favorites() {
  const [previewFile, setPreviewFile] = useState(null)
  const [files, setFiles] = useState([])

  const handleFileClick = (file) => {
    setPreviewFile(file)
  }

  const handleClosePreview = () => {
    setPreviewFile(null)
  }

  const handleNext = () => {
    if (!previewFile) return
    const currentIndex = files.findIndex((f) => f._id === previewFile._id)
    if (currentIndex < files.length - 1) {
      setPreviewFile(files[currentIndex + 1])
    }
  }

  const handlePrev = () => {
    if (!previewFile) return
    const currentIndex = files.findIndex((f) => f._id === previewFile._id)
    if (currentIndex > 0) {
      setPreviewFile(files[currentIndex - 1])
    }
  }

  const handleToggleFavorite = (fileId, isFavorite) => {
    setFiles((prev) =>
      prev.map((f) => (f._id === fileId ? { ...f, isFavorite } : f))
    )
    if (!isFavorite && previewFile && previewFile._id === fileId) {
      setPreviewFile(null)
    }
  }

  const handleFileUpdate = (updatedFile) => {
    setFiles((prev) =>
      prev.map((f) => (f._id === updatedFile._id ? updatedFile : f))
    )
    if (previewFile && previewFile._id === updatedFile._id) {
      setPreviewFile(updatedFile)
    }
  }

  // 自定义获取收藏文件的函数
  const fetchFavoriteFiles = async () => {
    try {
      const response = await fetch('/api/files?isFavorite=true')
      const data = await response.json()
      if (data.status === 'success') {
        const favoriteFiles = (data.data.files || []).filter(f => f.isFavorite)
        return favoriteFiles
      }
      return []
    } catch (err) {
      console.error('获取收藏文件失败:', err)
      return []
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">收藏</h1>
        <p className="text-muted-foreground">这里是收藏的文件</p>
      </div>

      <FileList
        fileType={null}
        onFileClick={handleFileClick}
        onFilesLoaded={setFiles}
        customFetch={fetchFavoriteFiles}
      />

      {previewFile && (
        <FilePreview
          file={previewFile}
          files={files}
          onClose={handleClosePreview}
          onNext={handleNext}
          onPrev={handlePrev}
          onToggleFavorite={handleToggleFavorite}
          onFileUpdate={handleFileUpdate}
        />
      )}
    </div>
  )
}

