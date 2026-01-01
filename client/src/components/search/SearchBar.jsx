import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function SearchBar({ onSearch, placeholder = "搜索文件或相册..." }) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(query)
      }
    }, 300) // 防抖延迟

    return () => clearTimeout(timer)
  }, [query, onSearch])

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className={cn(
        "relative flex items-center transition-all duration-300",
        isFocused && "scale-[1.02]"
      )}>
        <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pl-10 pr-10 h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 h-8 w-8 hover:bg-accent"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

