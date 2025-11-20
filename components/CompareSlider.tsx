import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeftRight, Download, X, ChevronDown } from 'lucide-react';
import { Button } from './Button';

interface CompareSliderProps {
  original: string;
  restored: string;
  onReset: () => void;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({ original, restored, onReset }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        handleMove(e.clientX);
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMove]);

  const handleDownload = (format: 'png' | 'jpeg' | 'webp') => {
    const img = new Image();
    img.src = restored;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // For JPEG, add white background in case of transparency
        if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `restored-image-${Date.now()}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setShowDownloadMenu(false);
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Restoration Complete</h2>
        
        <div className="flex gap-2 relative z-30">
            <Button variant="secondary" onClick={onReset} title="Close and start over">
                <X className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Close</span>
            </Button>
            
            <div className="relative">
                <Button 
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="min-w-[160px] justify-between"
                >
                   <span className="flex items-center">
                     <Download className="w-4 h-4 mr-2" /> Download
                   </span>
                   <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
                </Button>

                {showDownloadMenu && (
                    <>
                        <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => setShowDownloadMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/50">
                                Select Format
                            </div>
                            <button 
                                onClick={() => handleDownload('png')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-between group"
                            >
                                <span>PNG</span>
                                <span className="text-xs text-slate-500 group-hover:text-blue-100">Lossless</span>
                            </button>
                            <button 
                                onClick={() => handleDownload('jpeg')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-between group"
                            >
                                <span>JPG</span>
                                <span className="text-xs text-slate-500 group-hover:text-blue-100">Small</span>
                            </button>
                            <button 
                                onClick={() => handleDownload('webp')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-between group"
                            >
                                <span>WEBP</span>
                                <span className="text-xs text-slate-500 group-hover:text-blue-100">Modern</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>

      <div 
        className="relative w-full aspect-video md:aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl select-none group z-0"
        ref={containerRef}
        onTouchMove={handleTouchMove}
      >
        {/* Original Image (Background) */}
        <img 
          src={original} 
          alt="Original" 
          className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
        />
        
        {/* Label Original */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded pointer-events-none z-10">
          ORIGINAL
        </div>

        {/* Restored Image (Foreground, clipped) */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
        >
          <img 
            src={restored} 
            alt="Restored" 
            className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
          />
           {/* Label Restored */}
           <div className="absolute top-4 right-4 bg-blue-600/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded pointer-events-none z-10">
              RESTORED
            </div>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute inset-y-0 w-1 bg-white/50 backdrop-blur cursor-ew-resize z-20 hover:bg-blue-400 transition-colors"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:scale-110 transition-transform">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>
        
        {/* Processing/Scan effect overlay (optional visual flair) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
      
      <p className="text-center text-slate-500 mt-4 text-sm">
        Drag the slider to compare the before and after.
      </p>
    </div>
  );
};