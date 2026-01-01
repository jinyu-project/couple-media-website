import { useState } from 'react'
import FileUpload from '@/components/file/FileUpload'
import FileList from '@/components/file/FileList'
import FilePreview from '@/components/file/FilePreview'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'

export default function Photos() {
  const [showUpload, setShowUpload] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const [files, setFiles] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    // 触发文件列表刷新
    setRefreshKey(prev => prev + 1)
  }

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
  }

  const handleFileUpdate = (updatedFile) => {
    setFiles((prev) =>
      prev.map((f) => (f._id === updatedFile._id ? updatedFile : f))
    )
    if (previewFile && previewFile._id === updatedFile._id) {
      setPreviewFile(updatedFile)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">照片</h1>
          <p className="text-muted-foreground mt-1">管理您的照片</p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)}>
          <Upload className="h-4 w-4 mr-2" />
          {showUpload ? '取消上传' : '上传照片'}
        </Button>
      </div>

      {showUpload && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">上传照片</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowUpload(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <FileUpload fileType="photo" onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">所有照片</h2>
        <FileList
          key={refreshKey}
          fileType="photo"
          onFileClick={handleFileClick}
          onFilesLoaded={setFiles}
        />
      </div>

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

