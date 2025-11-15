import { FunctionMetadata } from '@/types'
import { CheckCircle2, Circle } from 'lucide-react'

interface FunctionListProps {
  functions: FunctionMetadata[]
  generatedDocstrings: Map<string, string>
}

export default function FunctionList({ functions, generatedDocstrings }: FunctionListProps) {
  if (functions.length === 0) {
    return (
      <div className="card">
        <p className="text-gray-400 text-center py-8">
          No functions or classes detected. Upload a file to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-white mb-4">
        Detected Functions & Classes
      </h2>
      <div className="space-y-3">
        {functions.map((func, index) => {
          const hasDocstring = generatedDocstrings.has(func.name)
          const hadDocstring = func.docstring !== undefined

          return (
            <div
              key={index}
              className="flex items-start justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {hasDocstring ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500" />
                  )}
                  <span className="font-mono text-sm font-medium text-white">
                    {func.name}
                  </span>
                  <span className="text-xs text-gray-400 px-2 py-1 bg-white/10 border border-white/20 rounded">
                    {func.type}
                  </span>
                </div>
                {func.params.length > 0 && (
                  <p className="text-sm text-gray-300 mt-1 ml-7">
                    Parameters: {func.params.join(', ')}
                  </p>
                )}
                {hadDocstring && !hasDocstring && (
                  <p className="text-xs text-yellow-400 mt-1 ml-7">
                    ⚠️ Has existing docstring
                  </p>
                )}
                {hasDocstring && (
                  <p className="text-xs text-green-400 mt-1 ml-7">
                    ✓ Docstring generated
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Lines {func.startLine + 1}–{func.endLine + 1}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
