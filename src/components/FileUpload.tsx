import { useCallback } from 'react'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void
  accept?: string
}

export default function FileUpload({ onFileSelect, accept = '.py,.js,.ts' }: FileUploadProps) {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        onFileSelect(file, content)
      }
      reader.readAsText(file)
    },
    [onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const file = e.dataTransfer.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        onFileSelect(file, content)
      }
      reader.readAsText(file)
    },
    [onFileSelect]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-white/20 rounded-2xl p-16 text-center hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer backdrop-blur-xl"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
        <div className="p-6 rounded-full bg-white/5 border border-white/10 mb-6">
          <Upload className="h-16 w-16 text-white" />
        </div>
        <p className="text-2xl font-semibold text-white mb-3">Upload Your Code</p>
        <p className="text-base text-gray-300 mb-2">Drop your file here or click to browse</p>
        <p className="text-sm text-gray-400">
          Supports Python (.py) and JavaScript (.js, .ts) files
        </p>
      </label>
    </div>
  )
}
