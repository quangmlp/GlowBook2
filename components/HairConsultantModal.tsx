import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, RefreshCcw, Check, Sparkles, User, Loader2, Eye, ArrowLeft } from 'lucide-react';
import { analyzeFaceAndRecommend, generateHairstylePreview } from '../services/gemini';
import { HairRecommendation } from '../types';

interface HairConsultantModalProps {
  onClose: () => void;
  onSearchStyle: (styleName: string) => void;
  // Lifted state props
  persistedImage: string | null;
  setPersistedImage: (img: string | null) => void;
  persistedResult: HairRecommendation | null;
  setPersistedResult: (res: HairRecommendation | null) => void;
}

type Step = 'initial' | 'camera' | 'preview' | 'analyzing' | 'results';

const HairConsultantModal: React.FC<HairConsultantModalProps> = ({ 
  onClose, 
  onSearchStyle,
  persistedImage,
  setPersistedImage,
  persistedResult,
  setPersistedResult
}) => {
  const [step, setStep] = useState<Step>(persistedResult ? 'results' : (persistedImage ? 'preview' : 'initial'));
  const [imageSrc, setImageSrc] = useState<string | null>(persistedImage);
  const [eventContext, setEventContext] = useState('');
  // Local result state, synced with parent via props
  const [result, setResult] = useState<HairRecommendation | null>(persistedResult);
  
  // State for image generation
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Stop camera when component unmounts or step changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setStep('camera');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      alert("Unable to access camera. Please try uploading an image instead.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setImageSrc(dataUrl);
        setPersistedImage(dataUrl); // Persist
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setStep('preview');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const data = reader.result as string;
        setImageSrc(data);
        setPersistedImage(data); // Persist
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageSrc) return;
    setStep('analyzing');
    const context = eventContext.trim() ? eventContext : "Everyday look";
    const data = await analyzeFaceAndRecommend(imageSrc, context);
    if (data) {
      setResult(data);
      setPersistedResult(data); // Persist
      setStep('results');
    } else {
      alert("Sorry, we couldn't analyze the image. Please try again.");
      setStep('preview');
    }
  };

  const handleVisualize = async (index: number) => {
    if (!result || !imageSrc || generatingIndex !== null) return;
    
    // Check if already generated
    if (result.styles[index].generatedImage) return;

    setGeneratingIndex(index);
    const style = result.styles[index];
    
    const generatedImg = await generateHairstylePreview(imageSrc, style.name, style.description);
    
    if (generatedImg) {
        const newResult = { ...result };
        newResult.styles[index].generatedImage = generatedImg;
        setResult(newResult);
        setPersistedResult(newResult); // Update persistence
    } else {
        alert("Could not generate image. Try again.");
    }
    setGeneratingIndex(null);
  };

  const handleReset = () => {
      setStep('initial');
      setImageSrc(null);
      setPersistedImage(null);
      setResult(null);
      setPersistedResult(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-gray-800 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            <h3 className="font-bold text-lg">AI Hair Consultant</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            
            {/* STEP 1: INITIAL */}
            {step === 'initial' && (
                <div className="text-center py-10 space-y-8">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find your perfect look</h2>
                        <p className="text-gray-500">We analyze your face shape to recommend styles that suit you best.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                        <button 
                            onClick={startCamera}
                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-secondary hover:bg-purple-50 transition-all group"
                        >
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:scale-110 transition-transform">
                                <Camera className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-gray-700">Use Camera</span>
                        </button>

                        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-secondary hover:bg-purple-50 transition-all group cursor-pointer">
                            <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-gray-700">Upload Photo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                </div>
            )}

            {/* STEP 2: CAMERA */}
            {step === 'camera' && (
                <div className="flex flex-col items-center">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg bg-black w-full max-w-md aspect-[3/4] mb-6">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                        <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-white/50 rounded-[50%] pointer-events-none opacity-50"></div>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <button 
                        onClick={capturePhoto}
                        className="bg-white border-4 border-gray-200 w-16 h-16 rounded-full flex items-center justify-center hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
                    >
                        <div className="w-12 h-12 bg-red-500 rounded-full"></div>
                    </button>
                </div>
            )}

            {/* STEP 3: PREVIEW & CONTEXT */}
            {step === 'preview' && imageSrc && (
                <div className="max-w-md mx-auto">
                    <div className="flex gap-4 mb-6">
                        <div className="w-1/3 rounded-xl overflow-hidden shadow-md">
                            <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Occasion / Event</label>
                                <input 
                                    type="text" 
                                    value={eventContext}
                                    onChange={(e) => setEventContext(e.target.value)}
                                    placeholder="e.g. Wedding, Job Interview, Summer..." 
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:outline-none"
                                />
                            </div>
                            <button 
                                onClick={() => { setStep('initial'); setImageSrc(null); setPersistedImage(null); }}
                                className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                            >
                                <RefreshCcw className="w-3 h-3" /> Retake Photo
                            </button>
                        </div>
                    </div>
                    <button 
                        onClick={handleAnalyze}
                        className="w-full bg-secondary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-5 h-5" /> Analyze & Recommend
                    </button>
                </div>
            )}

            {/* STEP 4: ANALYZING */}
            {step === 'analyzing' && (
                <div className="text-center py-20">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto text-secondary w-8 h-8 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing your features...</h3>
                    <p className="text-gray-500">Our AI is matching your face shape with current trends.</p>
                </div>
            )}

            {/* STEP 5: RESULTS */}
            {step === 'results' && result && (
                <div className="space-y-6">
                    {/* Analysis Summary */}
                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 flex items-start gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <User className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Face Shape</span>
                                <span className="text-lg font-bold text-gray-900">{result.faceShape}</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{result.analysis}</p>
                        </div>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900">Recommended Styles</h3>
                    
                    <div className="grid gap-6">
                        {result.styles.map((style, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-primary text-lg">{style.name}</h4>
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                                            Match {98 - idx * 5}%
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">{style.description}</p>
                                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 italic mb-4">
                                        Why: {style.reasoning}
                                    </div>

                                    {/* VISUALIZER SECTION */}
                                    {style.generatedImage ? (
                                        <div className="mb-4 space-y-3 animate-fade-in">
                                             <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden border border-gray-100">
                                                 <img src={style.generatedImage} alt={style.name} className="w-full h-full object-cover" />
                                                 <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center">
                                                     <Sparkles className="w-3 h-3 mr-1 text-secondary" /> AI Preview
                                                 </div>
                                             </div>
                                             <div className="flex gap-2">
                                                 <button 
                                                    onClick={() => {
                                                        onSearchStyle(style.name);
                                                        // Note: We do NOT clear state here. Modal closes, but state persists in App.
                                                        onClose();
                                                    }}
                                                    className="flex-1 py-2.5 bg-secondary text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-sm shadow-md"
                                                >
                                                    Find Salons
                                                </button>
                                             </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleVisualize(idx)}
                                            disabled={generatingIndex !== null}
                                            className="w-full py-3 border-2 border-secondary/30 bg-purple-50 text-secondary font-bold rounded-lg hover:bg-secondary hover:text-white transition-all text-sm flex items-center justify-center gap-2 group"
                                        >
                                            {generatingIndex === idx ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Generating AI Preview...
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
                                                    Visualize this Style
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleReset}
                        className="w-full text-center text-gray-500 hover:text-primary text-sm font-medium mt-4 flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" /> Start Over
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HairConsultantModal;