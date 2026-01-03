import { useState } from 'react'
import FileUpload from '@/components/file/FileUpload'
import FileList from '@/components/file/FileList'
import FilePreview from '@/components/file/FilePreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, FolderPlus, CheckSquare, Square } from 'lucide-react'

export default function Photos() {
  const [showUpload, setShowUpload] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const [files, setFiles] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [showCreateAlbum, setShowCreateAlbum] = useState(false)
  const [albumName, setAlbumName] = useState('')
  const [albumDescription, setAlbumDescription] = useState('')

  const handleUploadSuccess = () => {
    // 触发文件列表刷新
    setRefreshKey(prev => prev + 1)
  }

  const handleFileClick = (file) => {
    if (!selectionMode) {
      setPreviewFile(file)
    }
  }

  const handleClosePreview = () => {
    setPreviewFile(null)
  }

  const handleNext = () => {
    if (!previewFile) return
    const currentIndex = files.findIndex((f) => (f._id || f.id) === (previewFile._id || previewFile.id))
    if (currentIndex < files.length - 1) {
      setPreviewFile(files[currentIndex + 1])
    }
  }

  const handlePrev = () => {
    if (!previewFile) return
    const currentIndex = files.findIndex((f) => (f._id || f.id) === (previewFile._id || previewFile.id))
    if (currentIndex > 0) {
      setPreviewFile(files[currentIndex - 1])
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

  // 切换选择模式
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    if (selectionMode) {
      setSelectedFiles([])
    }
  }

  // 处理选择变化
  const handleSelectionChange = (selectedIds) => {
    setSelectedFiles(selectedIds)
  }

  // 创建相册集
  const handleCreateAlbum = async () => {
    if (!albumName.trim()) {
      alert('请输入相册名称')
      return
    }

    if (selectedFiles.length === 0) {
      alert('请至少选择一张照片')
      return
    }

    try {
      // 创建相册
      const createResponse = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: albumName,
          description: albumDescription,
        }),
      })

      const createData = await createResponse.json()
      if (createData.status !== 'success') {
        throw new Error(createData.message || '创建相册失败')
      }

      const albumId = createData.data.album.id || createData.data.album._id

      // 将选中的照片添加到相册
      for (const fileId of selectedFiles) {
        await fetch(`/api/albums/${albumId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId }),
        })
      }

      alert('相册集创建成功！')
      setShowCreateAlbum(false)
      setAlbumName('')
      setAlbumDescription('')
      setSelectedFiles([])
      setSelectionMode(false)
    } catch (err) {
      console.error('创建相册集失败:', err)
      alert('创建相册集失败：' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">照片</h1>
          <p className="text-muted-foreground mt-1">管理您的照片</p>
        </div>
        <div className="flex gap-2">
          {selectionMode && selectedFiles.length > 0 && (
            <Button
              onClick={() => setShowCreateAlbum(true)}
              className="bg-gradient-to-r from-primary to-pink-500"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              创建相册集 ({selectedFiles.length})
            </Button>
          )}
          <Button
            variant={selectionMode ? 'default' : 'outline'}
            onClick={toggleSelectionMode}
          >
            {selectionMode ? (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                取消选择
              </>
            ) : (
              <>
                <Square className="h-4 w-4 mr-2" />
                选择照片
              </>
            )}
          </Button>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4 mr-2" />
            {showUpload ? '取消上传' : '上传照片'}
          </Button>
        </div>
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
          enableSelection={selectionMode}
          selectedFiles={selectedFiles}
          onSelectionChange={handleSelectionChange}
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

      {/* 创建相册集对话框 */}
      {showCreateAlbum && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>创建相册集</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCreateAlbum(false)
                    setAlbumName('')
                    setAlbumDescription('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">相册名称</label>
                <Input
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="例如：旅行回忆"
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">描述（可选）</label>
                <Input
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  placeholder="相册描述..."
                  className="rounded-lg"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                将添加 {selectedFiles.length} 张照片到相册集
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateAlbum(false)
                    setAlbumName('')
                    setAlbumDescription('')
                  }}
                >
                  取消
                </Button>
                <Button
                  onClick={handleCreateAlbum}
                  className="bg-gradient-to-r from-primary to-pink-500"
                >
                  创建
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
