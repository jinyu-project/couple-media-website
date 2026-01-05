import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span className="text-xl font-bold">情侣专属空间</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost">首页</Button>
          </Link>
          <Link to="/photos">
            <Button variant="ghost">照片</Button>
          </Link>
          <Link to="/videos">
            <Button variant="ghost">视频</Button>
          </Link>
          <Link to="/documents">
            <Button variant="ghost">文档</Button>
          </Link>
          <Link to="/albums">
            <Button variant="ghost">相册</Button>
          </Link>
          <Link to="/novels">
            <Button variant="ghost">小说</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

