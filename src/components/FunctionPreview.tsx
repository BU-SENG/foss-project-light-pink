import React from 'react';
import Editor from '@monaco-editor/react';
import { X, Copy } from 'lucide-react';
import { FunctionInfo, SupportedLanguage } from '@/types';

interface Props {
  functionInfo: FunctionInfo | null;
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
}

const mapLang = (l: SupportedLanguage) => (l === SupportedLanguage.Python ? 'python' : 'javascript');

const FunctionPreview: React.FC<Props> = ({ functionInfo, isOpen, onClose, language }) => {
  if (!isOpen || !functionInfo) return null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(functionInfo.originalCode);
    } catch (e) {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <aside className="ml-auto w-full max-w-2xl bg-white h-full shadow-xl p-4 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">{functionInfo.name}()</h3>
            <div className="text-sm text-gray-500">Lines {functionInfo.startLine} - {functionInfo.endLine}</div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={copyCode} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm flex items-center space-x-2"><Copy className="w-4 h-4" /> <span>Copy</span></button>
            <button onClick={onClose} aria-label="Close preview" className="p-2 rounded hover:bg-gray-100"><X /></button>
          </div>
        </div>

        {functionInfo.docstring && (
          <div className="mb-3 p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap">
            {functionInfo.docstring}
          </div>
        )}

        <div className="h-[70vh] border rounded">
          <Editor
            height="100%"
            language={mapLang(language)}
            value={functionInfo.originalCode}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </div>
      </aside>
    </div>
  );
};

export default FunctionPreview;
