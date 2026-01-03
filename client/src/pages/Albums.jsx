import { useState, useEffect } from 'react'
import AlbumManager from '@/components/album/AlbumManager'
import FilePreview from '@/components/file/FilePreview'
import FileList from '@/components/file/FileList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Albums() {
  const [selectedAlbumId, setSelectedAlbumId] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [files, setFiles] = useState([])
  const [album, setAlbum] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAddPhotos, setShowAddPhotos] = useState(false)
  const [allPhotos, setAllPhotos] = useState([])
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [selectionMode, setSelectionMode] = useState(false)

  // 获取相册详情
  const fetchAlbumDetails = async () => {
    if (!selectedAlbumId) return
    
    try {
      const response = await fetch(`/api/albums/${selectedAlbumId}`)
      const data = await response.json()
      if (data.status === 'success' && data.data.album) {
        const albumData = data.data.album
        setAlbum(albumData)
        // 只获取照片类型的文件
        const photoFiles = (albumData.files || []).filter(f => f.type === 'photo')
        setFiles(photoFiles)
        setCurrentIndex(0)
      }
    } catch (err) {
      console.error('获取相册详情失败:', err)
    }
  }

  useEffect(() => {
    fetchAlbumDetails()
  }, [selectedAlbumId])

  // 获取所有照片
  const fetchAllPhotos = async () => {
    try {
      const response = await fetch('/api/files/type/photo')
      const data = await response.json()
      if (data.status === 'success') {
        const photos = data.data.files || []
        setAllPhotos(photos)
      }
    } catch (err) {
      console.error('获取照片列表失败:', err)
    }
  }

  useEffect(() => {
    if (showAddPhotos) {
      fetchAllPhotos()
      setSelectedPhotos([])
      setSelectionMode(false)
    }
  }, [showAddPhotos])

  const handleFileClick = (file) => {
    const index = files.findIndex((f) => (f._id || f.id) === (file._id || file.id))
    if (index !== -1) {
      setCurrentIndex(index)
      setPreviewFile(file)
    }
  }

  const handleClosePreview = () => {
    setPreviewFile(null)
  }

  const handleNext = () => {
    if (currentIndex < files.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setPreviewFile(files[nextIndex])
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setPreviewFile(files[prevIndex])
    }
  }

  const handleToggleFavorite = (fileId, isFavorite) => {
    setFiles((prev) =>
      prev.map((f) => ((f._id || f.id) === fileId ? { ...f, isFavorite } : f))
    )
  }

  const handleFileUpdate = (updatedFile) => {
    setFiles((prev) =>
      prev.map((f) => ((f._id || f.id) === (updatedFile._id || updatedFile.id) ? updatedFile : f))
    )
    if (previewFile && (previewFile._id || previewFile.id) === (updatedFile._id || updatedFile.id)) {
      setPreviewFile(updatedFile)
    }
  }

  // 添加照片到相册
  const handleAddPhotos = async () => {
    if (selectedPhotos.length === 0) {
      alert('请至少选择一张照片')
      return
    }

    try {
      for (const photoId of selectedPhotos) {
        await fetch(`/api/albums/${selectedAlbumId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: photoId }),
        })
      }
      
      alert(`成功添加 ${selectedPhotos.length} 张照片到相册`)
      setShowAddPhotos(false)
      setSelectedPhotos([])
      fetchAlbumDetails() // 刷新相册详情
    } catch (err) {
      console.error('添加照片失败:', err)
      alert('添加照片失败：' + err.message)
    }
  }

  // 从相册删除照片
  const handleRemovePhoto = async (fileId, e) => {
    e.stopPropagation()
    if (!confirm('确定要从相册中移除这张照片吗？')) return

    try {
      const response = await fetch(`/api/albums/${selectedAlbumId}/files/${fileId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.status === 'success') {
        // 从列表中移除
        const updatedFiles = files.filter((f) => (f._id || f.id) !== fileId)
        setFiles(updatedFiles)
        
        // 如果删除的是当前预览的照片，关闭预览
        if (previewFile && (previewFile._id || previewFile.id) === fileId) {
          setPreviewFile(null)
        }
        
        // 调整当前索引
        if (currentIndex >= updatedFiles.length && updatedFiles.length > 0) {
          setCurrentIndex(updatedFiles.length - 1)
        } else if (updatedFiles.length === 0) {
          setCurrentIndex(0)
        }
        
        fetchAlbumDetails() // 刷新相册详情
      } else {
        alert(data.message || '删除失败')
      }
    } catch (err) {
      console.error('删除照片失败:', err)
      alert('删除照片失败，请稍后重试')
    }
  }

  // 处理照片选择
  const handlePhotoSelect = (photoId) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId)
      } else {
        return [...prev, photoId]
      }
    })
  }

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedAlbumId || showAddPhotos) return
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrev()
      } else if (e.key === 'ArrowRight' && currentIndex < files.length - 1) {
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, files.length, selectedAlbumId, showAddPhotos])

  // 获取文件预览URL
  const getPreviewUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return url.startsWith('/') ? url : `/api/files${url}`
  }

  // 检查照片是否已在相册中
  const isPhotoInAlbum = (photoId) => {
    return files.some(f => (f._id || f.id) === photoId)
  }

  return (
    <div className="space-y-6">
      {selectedAlbumId ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedAlbumId(null)
                  setPreviewFile(null)
                  setShowAddPhotos(false)
                }}
                className="mb-2"
              >
                <X className="h-4 w-4 mr-2" />
                返回相册列表
              </Button>
              <h1 className="text-3xl font-bold">{album?.name || '相册'}</h1>
              {album?.description && (
                <p className="text-muted-foreground mt-1">{album.description}</p>
              )}
            </div>
            <Button
              onClick={() => setShowAddPhotos(true)}
              className="bg-gradient-to-r from-primary to-pink-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加照片
            </Button>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">这个相册还没有照片</p>
              <Button
                onClick={() => setShowAddPhotos(true)}
                className="bg-gradient-to-r from-primary to-pink-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加照片
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 照片网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                {files.map((file, index) => {
                  const previewUrl = getPreviewUrl(file.thumbnailUrl || file.url)
                  
                  return (
                    <div
                      key={file._id || file.id}
                      className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer transition-all duration-200 group hover:scale-105"
                      onClick={() => {
                        setCurrentIndex(index)
                        setPreviewFile(file)
                      }}
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground">无预览</span>
                        </div>
                      )}
                      {/* 删除按钮 */}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleRemovePhoto(file._id || file.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <AlbumManager
          onAlbumSelect={setSelectedAlbumId}
          selectedAlbumId={selectedAlbumId}
        />
      )}

      {/* 添加照片模态框 */}
      {showAddPhotos && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>选择照片添加到相册</CardTitle>
                <div className="flex items-center gap-2">
                  {selectedPhotos.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      已选择 {selectedPhotos.length} 张
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowAddPhotos(false)
                      setSelectedPhotos([])
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {allPhotos.map((photo) => {
                  const previewUrl = getPreviewUrl(photo.thumbnailUrl || photo.url)
                  const isSelected = selectedPhotos.includes(photo._id || photo.id)
                  const inAlbum = isPhotoInAlbum(photo._id || photo.id)
                  
                  return (
                    <div
                      key={photo._id || photo.id}
                      className={cn(
                        "relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer transition-all",
                        isSelected && "ring-2 ring-primary",
                        inAlbum && "opacity-50"
                      )}
                      onClick={() => !inAlbum && handlePhotoSelect(photo._id || photo.id)}
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground">无预览</span>
                        </div>
                      )}
                      {/* 选择标记 */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          ✓
                        </div>
                      )}
                      {/* 已在相册中标记 */}
                      {inAlbum && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">已在相册中</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {allPhotos.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">还没有照片，先去上传一些吧</p>
                </div>
              )}
            </CardContent>
            <div className="border-t p-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddPhotos(false)
                  setSelectedPhotos([])
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleAddPhotos}
                disabled={selectedPhotos.length === 0}
                className="bg-gradient-to-r from-primary to-pink-500"
              >
                添加 {selectedPhotos.length > 0 ? `(${selectedPhotos.length})` : ''}
              </Button>
            </div>
          </Card>
        </div>
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
