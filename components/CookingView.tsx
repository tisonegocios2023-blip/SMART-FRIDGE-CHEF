import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, ChevronRight, ChevronLeft, Volume2, CheckCircle, ShoppingBag } from 'lucide-react';
import { Recipe } from '../types';
import { generateSpeech } from '../services/geminiService';

interface CookingViewProps {
  recipe: Recipe;
  onBack: () => void;
  onAddIngredient: (ingredient: string) => void;
  shoppingList: string[];
}

const CookingView: React.FC<CookingViewProps> = ({ recipe, onBack, onAddIngredient, shoppingList }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) { /* ignore */ }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = async () => {
    if (!audioContextRef.current) return;
    
    // If resuming
    if (audioBufferRef.current && !isPlaying) {
      const ctx = audioContextRef.current;
      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(ctx.destination);
      
      const offset = pauseTimeRef.current;
      source.start(0, offset);
      startTimeRef.current = ctx.currentTime - offset;
      
      sourceNodeRef.current = source;
      setIsPlaying(true);
      
      source.onended = () => {
        setIsPlaying(false);
        pauseTimeRef.current = 0;
      };
      return;
    }

    // New generation
    setIsLoadingAudio(true);
    const textToSpeak = recipe.instructions[currentStep];
    const buffer = await generateSpeech(textToSpeak);
    setIsLoadingAudio(false);

    if (buffer) {
      audioBufferRef.current = buffer;
      const ctx = audioContextRef.current;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.start(0);
      startTimeRef.current = ctx.currentTime;
      pauseTimeRef.current = 0;
      
      sourceNodeRef.current = source;
      setIsPlaying(true);
      
      source.onended = () => {
        setIsPlaying(false);
        pauseTimeRef.current = 0;
      };
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      // Pause
      if (audioContextRef.current) {
        pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      }
      stopAudio();
    } else {
      playAudio();
    }
  };

  const handleStepChange = (newStep: number) => {
    stopAudio();
    audioBufferRef.current = null; // Clear buffer for new step
    pauseTimeRef.current = 0;
    setCurrentStep(newStep);
  };

  const progress = ((currentStep + 1) / recipe.instructions.length) * 100;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center mx-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Step {currentStep + 1} of {recipe.instructions.length}
          </h2>
          <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center text-center max-w-3xl mx-auto w-full">
        <div className="mb-8">
           <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-6">
             {recipe.instructions[currentStep]}
           </h3>
        </div>

        {/* TTS Controls */}
        <button
          onClick={togglePlay}
          disabled={isLoadingAudio}
          className={`
            flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95
            ${isPlaying ? 'bg-amber-100 text-amber-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}
            ${isLoadingAudio ? 'opacity-70 cursor-wait' : ''}
          `}
        >
          {isLoadingAudio ? (
             <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isPlaying ? (
            <Pause size={32} fill="currentColor" />
          ) : (
            <Volume2 size={32} />
          )}
        </button>
        <p className="mt-3 text-sm text-slate-400 font-medium">
          {isPlaying ? 'Reading...' : 'Tap to read aloud'}
        </p>

        {/* Missing Ingredients Check (Only on step 1/overview context really, but let's put it here if applicable or just show used ingredients for context) */}
        {currentStep === 0 && recipe.missingIngredients.length > 0 && (
          <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100 w-full text-left">
            <h4 className="text-sm font-bold text-orange-800 uppercase mb-2 flex items-center">
              <ShoppingBag size={16} className="mr-2" /> Missing Ingredients
            </h4>
            <div className="flex flex-wrap gap-2">
              {recipe.missingIngredients.map(ing => (
                <button
                  key={ing}
                  onClick={() => onAddIngredient(ing)}
                  disabled={shoppingList.includes(ing)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-colors border
                    ${shoppingList.includes(ing)
                      ? 'bg-green-100 text-green-700 border-green-200 cursor-default'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-600'}
                  `}
                >
                  {shoppingList.includes(ing) ? 'Added ✓' : `+ ${ing}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
        <button
          onClick={() => handleStepChange(currentStep - 1)}
          disabled={currentStep === 0}
          className={`
            flex items-center px-6 py-4 rounded-xl font-bold transition-all
            ${currentStep === 0 
              ? 'opacity-0 pointer-events-none' 
              : 'bg-white text-slate-700 shadow-sm hover:shadow hover:bg-slate-50 border border-slate-200'}
          `}
        >
          <ChevronLeft size={20} className="mr-2" />
          Previous
        </button>

        {currentStep < recipe.instructions.length - 1 ? (
          <button
            onClick={() => handleStepChange(currentStep + 1)}
            className="flex items-center px-6 py-4 rounded-xl font-bold bg-slate-900 text-white shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all"
          >
            Next Step
            <ChevronRight size={20} className="ml-2" />
          </button>
        ) : (
           <button
            onClick={onBack}
            className="flex items-center px-6 py-4 rounded-xl font-bold bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all"
          >
            <CheckCircle size={20} className="mr-2" />
            Finish Cooking
          </button>
        )}
      </div>
    </div>
  );
};

export default CookingView;