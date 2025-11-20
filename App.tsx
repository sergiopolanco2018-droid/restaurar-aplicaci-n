import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { CompareSlider } from './components/CompareSlider';
import { restoreImage } from './services/geminiService';
import { AppStatus, RestorationResult } from './types';
import { Wand2, AlertTriangle } from 'lucide-react';

// Default prompt based on user request
const RESTORATION_PROMPT = "Actúa como un equipo experto en restaurar fotografías. Restaura esta fotografía antigua. Elimina todos los arañazos, manchas, desgarros y el desgaste general. Preserva los detalles faciales y la textura original tanto como sea posible. Mejora la nitidez y el contraste. Estilo fotorrealista de alta resolución.";

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [currentImage, setCurrentImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [result, setResult] = useState<RestorationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleImageSelect = (base64: string, mimeType: string) => {
    setCurrentImage({ data: base64, mimeType });
    setStatus(AppStatus.IDLE);
    setResult(null);
    setErrorMsg('');
  };

  const handleRestoration = async () => {
    if (!currentImage) return;

    setStatus(AppStatus.PROCESSING);
    setErrorMsg('');

    try {
      const restoredData = await restoreImage({
        imageBase64: currentImage.data,
        mimeType: currentImage.mimeType,
        prompt: RESTORATION_PROMPT
      });

      setResult({
        originalImage: currentImage.data,
        restoredImage: restoredData
      });
      setStatus(AppStatus.SUCCESS);
    } catch (error: any) {
      console.error("Restoration failed:", error);
      setStatus(AppStatus.ERROR);
      setErrorMsg(error.message || "Something went wrong during the restoration process. Please try again.");
    }
  };

  const handleReset = () => {
    setCurrentImage(null);
    setResult(null);
    setStatus(AppStatus.IDLE);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
        
        {/* Header Text */}
        {status === AppStatus.IDLE && !currentImage && (
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Restaura tus Recuerdos al Instante
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Devuelve la vida a tus fotos antiguas, dañadas o borrosas utilizando IA avanzada. 
              Simplemente sube tu foto y deja que nuestro modelo experto en restauración haga su magia.
            </p>
          </div>
        )}

        {/* Main Content Area */}
        <div className="w-full">
          
          {/* 1. Upload State */}
          {!currentImage && (
            <ImageUploader onImageSelect={handleImageSelect} />
          )}

          {/* 2. Preview & Action State */}
          {currentImage && status !== AppStatus.SUCCESS && (
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center animate-in fade-in zoom-in duration-300">
               {status === AppStatus.ERROR && (
                <div className="w-full mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Restoration Failed</p>
                    <p className="text-sm opacity-90">{errorMsg}</p>
                  </div>
                </div>
              )}

              <div className="relative w-full aspect-video md:aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 mb-8 group">
                <img 
                  src={currentImage.data} 
                  alt="Preview" 
                  className={`w-full h-full object-contain transition-opacity duration-500 ${status === AppStatus.PROCESSING ? 'opacity-50 scale-105' : 'opacity-100'}`} 
                />
                
                {status === AppStatus.PROCESSING && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-slate-900/30 z-10">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-blue-600/20"></div>
                    <p className="text-xl font-semibold text-white animate-pulse">Restoring Details...</p>
                    <p className="text-sm text-blue-300 mt-2">This might take a few seconds</p>
                  </div>
                )}

                {status === AppStatus.IDLE && (
                  <div className="absolute top-4 right-4">
                     <Button variant="secondary" size="sm" onClick={handleReset} className="bg-black/50 backdrop-blur border-transparent hover:bg-black/70">
                       Remove
                     </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                 <Button 
                  variant="secondary" 
                  onClick={handleReset}
                  disabled={status === AppStatus.PROCESSING}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRestoration} 
                  isLoading={status === AppStatus.PROCESSING}
                  className="px-8"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {status === AppStatus.ERROR ? 'Try Again' : 'Restore Photo'}
                </Button>
              </div>
            </div>
          )}

          {/* 3. Success/Compare State */}
          {result && status === AppStatus.SUCCESS && (
            <CompareSlider 
              original={result.originalImage}
              restored={result.restoredImage}
              onReset={handleReset}
            />
          )}

        </div>
      </main>
      
      <footer className="w-full p-6 border-t border-slate-800 bg-slate-900 text-center">
         <p className="text-slate-500 text-sm">
           &copy; {new Date().getFullYear()} RestaurAI. Uses Gemini 2.5 Flash Image Model.
         </p>
      </footer>
    </div>
  );
};

export default App;