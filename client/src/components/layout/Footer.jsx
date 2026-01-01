export default function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 情侣专属存储空间. 保留所有权利.</p>
          <p className="mt-2">用心记录每一刻美好时光</p>
        </div>
      </div>
    </footer>
  )
}

