import { useState } from 'react'
import AlbumManager from '@/components/album/AlbumManager'
import FileList from '@/components/file/FileList'
import FilePreview from '@/components/file/FilePreview'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function Albums() {
  const [selectedAlbumId, setSelectedAlbumId] = useState(null)
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
      {selectedAlbumId ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => setSelectedAlbumId(null)}
                className="mb-2"
              >
                <X className="h-4 w-4 mr-2" />
                返回相册列表
              </Button>
              <h1 className="text-3xl font-bold">相册内容</h1>
            </div>
          </div>
          <FileList
            fileType={null}
            albumId={selectedAlbumId}
            onFileClick={handleFileClick}
            onFilesLoaded={setFiles}
          />
        </>
      ) : (
        <AlbumManager
          onAlbumSelect={setSelectedAlbumId}
          selectedAlbumId={selectedAlbumId}
        />
      )}

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

