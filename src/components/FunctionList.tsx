import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { FunctionInfo, SupportedLanguage } from '@/types';

interface Props {
  functions: FunctionInfo[];
  onSelectionChange: (selected: string[]) => void;
  language: SupportedLanguage;
  loading?: boolean;
}

const ITEM_HEIGHT = 96; // px per card (approx)

const truncateLines = (text = '', lines = 3) => {
  const split = text.split(/\r?\n/);
  if (split.length <= lines) return text;
  return split.slice(0, lines).join('\n');
};

const FunctionCard: React.FC<{
  fn: FunctionInfo;
  checked: boolean;
  onToggle: () => void;
  onPreview: () => void;
}> = React.memo(({ fn, checked, onToggle, onPreview }) => {
  const hasDoc = Boolean(fn.docstring && fn.docstring.trim());
  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded border bg-white hover:shadow transition-all ${checked ? 'border-indigo-400' : 'border-gray-200'}`}
      role="listitem"
    >
      <div className="flex-shrink-0 pt-1">
        <input
          aria-label={`Select ${fn.name}`}
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="h-4 w-4 text-indigo-600"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-gray-800">{fn.name}()</div>
            <div className="text-xs text-gray-500 mt-1">
              {fn.parameters.map((p) => p.name).slice(0, 5).join(', ')}{fn.parameters.length > 5 ? ', …' : ''}
            </div>
          </div>
          <div className="text-xs text-gray-400">{fn.startLine}-{fn.endLine}</div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-gray-600 whitespace-pre-wrap max-w-[60%]">{truncateLines(fn.docstring, 3) || <span className="text-gray-400 italic">No docstring</span>}</div>
          <div className="flex items-center space-x-2">
            <button onClick={onPreview} className="text-xs text-indigo-600 hover:underline">Preview</button>
          </div>
        </div>
      </div>
    </div>
  );
});

const FunctionList: React.FC<Props> = ({ functions, onSelectionChange, language, loading = false }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(() => functions.filter((f) => f.isSelected).map((f) => f.name)));
  const [query, setQuery] = useState('');
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollStart, setScrollStart] = useState(0);

  useEffect(() => {
    // initialize selection when functions change
    setSelected(new Set(functions.filter((f) => f.isSelected).map((f) => f.name)));
  }, [functions]);

  useEffect(() => {
    onSelectionChange(Array.from(selected));
  }, [selected, onSelectionChange]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return functions;
    return functions.filter((f) => f.name.toLowerCase().includes(q));
  }, [functions, query]);

  // simple windowing virtualization
  const visibleCount = 6; // show roughly 6 items
  const startIndex = Math.max(0, Math.floor(scrollStart / ITEM_HEIGHT));
  const endIndex = Math.min(filtered.length, startIndex + visibleCount + 2);
  const paddingTop = startIndex * ITEM_HEIGHT;
  const paddingBottom = Math.max(0, (filtered.length - endIndex) * ITEM_HEIGHT);

  const onScroll = useCallback(() => {
    if (!containerRef.current) return;
    setScrollStart(containerRef.current.scrollTop);
  }, []);

  const toggleOne = (name: string) => {
    setSelected((s) => {
      const copy = new Set(s);
      if (copy.has(name)) copy.delete(name);
      else copy.add(name);
      return copy;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((f) => f.name)));
    }
  };

  const handlePreview = (fn: FunctionInfo) => {
    // emit a custom event for parent to pick up preview - this keeps component decoupled
    window.dispatchEvent(new CustomEvent('functionPreview', { detail: fn }));
  };

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const active = document.activeElement;
      if (active && containerRef.current.contains(active)) {
        if (e.key === ' ') {
          e.preventDefault();
          const first = filtered[0];
          if (first) toggleOne(first.name);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input type="checkbox" aria-label="Select all functions" onChange={toggleAll} checked={selected.size === filtered.length && filtered.length > 0} />
            <span className="text-sm">Select all</span>
          </label>
          <div className="text-sm text-gray-500">{selected.size} of {filtered.length} selected</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              aria-label="Filter functions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 pr-3 py-1 border rounded w-64 text-sm"
              placeholder="Filter by name..."
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="max-h-[520px] overflow-auto" ref={containerRef} onScroll={onScroll} role="list" tabIndex={0}>
          <div style={{ paddingTop, paddingBottom }}>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg font-medium">No functions found</div>
                <div className="text-sm mt-2">Upload a Python or JavaScript file to see extracted functions.</div>
              </div>
            ) : (
              filtered.slice(startIndex, endIndex).map((fn) => (
                <div key={fn.name} style={{ height: ITEM_HEIGHT - 8 }} className="p-2">
                  <FunctionCard
                    fn={fn}
                    checked={selected.has(fn.name)}
                    onToggle={() => toggleOne(fn.name)}
                    onPreview={() => handlePreview(fn)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(FunctionList);
