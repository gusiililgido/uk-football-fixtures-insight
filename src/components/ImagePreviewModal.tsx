import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImagePreviewModalProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  title,
  subtitle,
  onClose,
}) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex flex-col justify-between p-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-3xl w-full mx-auto flex items-center justify-between bg-[#0B0F19] text-white px-4 py-3 rounded-2xl border border-slate-800"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-blue-400 uppercase">
            <ZoomIn className="w-4 h-4 shrink-0" />
            <span className="truncate">{title}</span>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-300 truncate mt-0.5">{subtitle}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-3xl w-full mx-auto my-auto flex items-center justify-center overflow-auto max-h-[80vh]"
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-auto h-auto max-w-full max-h-[78vh] object-contain rounded-2xl border border-slate-700 shadow-2xl"
        />
      </div>
    </div>
  );
};
