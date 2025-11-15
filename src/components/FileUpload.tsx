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
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors cursor-pointer"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Drop your file here or click to browse
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Supports Python (.py) and JavaScript (.js, .ts) files
        </p>
      </label>
    </div>
  )
}
