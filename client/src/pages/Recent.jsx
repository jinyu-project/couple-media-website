import { useState } from 'react'
import FileList from '@/components/file/FileList'
import FilePreview from '@/components/file/FilePreview'

export default function Recent() {
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
      <div>
        <h1 className="text-3xl font-bold">最近</h1>
        <p className="text-muted-foreground">这里是最近访问的文件</p>
      </div>

      <FileList
        fileType={null}
        onFileClick={handleFileClick}
        onFilesLoaded={setFiles}
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

