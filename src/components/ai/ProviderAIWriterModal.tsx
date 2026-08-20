import { useState } from 'react';
import { Check, Sparkles, Wand2, X } from 'lucide-react';
import { generateProviderContent, type ProviderContentOutput } from '../../services/ai/aiService';
import { Button, Input } from '../ui';

export function ProviderAIWriterModal({
  kind,
  currentTitle = '',
  district = 'Ranchi',
  onApply,
}: {
  kind: 'stay' | 'product' | 'tour' | 'experience' | 'transport';
  currentTitle?: string;
  district?: string;
  onApply: (data: {
    title: string;
    shortDescription: string;
    description: string;
    highlights?: string[];
  }) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [titleInput, setTitleInput] = useState(currentTitle);
  const [highlightsInput, setHighlightsInput] = useState('');
  const [generatedResult, setGeneratedResult] = useState<ProviderContentOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateProviderContent({
        kind,
        title: titleInput || 'Authentic Local Offering',
        district,
        keyHighlights: highlightsInput || 'high quality local service',
      });
      setGeneratedResult(result);
    } catch (err) {
      console.error('[Provider AI Writer] Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedResult) return;
    onApply({
      title: generatedResult.enhancedTitle,
      shortDescription: generatedResult.shortDescription,
      description: generatedResult.detailedDescription,
      highlights: generatedResult.amenitiesOrHighlights,
    });
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          setTitleInput(currentTitle);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 text-xs font-bold border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100"
      >
        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
        <span>AI Writer Assistant</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="flex flex-col w-full max-w-xl max-h-[90vh] rounded-3xl bg-[#FAF8F5] border border-ink-200 shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-ink-200/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-forest-900 text-amber-400 flex items-center justify-center">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-ink-950">
                    Provider AI Content Generator
                  </h3>
                  <p className="text-[11px] text-ink-500 capitalize">
                    Craft SEO-friendly, authentic descriptions for {kind} listings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-ink-400 hover:text-ink-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-ink-200/80">
                <div>
                  <label className="block text-[11px] font-bold text-ink-700 uppercase tracking-wider mb-1">
                    Listing Title or Concept
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Netarhat Pine Resort or Sohrai Terracotta Vase"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-700 uppercase tracking-wider mb-1">
                    Key Features / Notes (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Solar power, forest view, handmade by Santhal master artisans"
                    value={highlightsInput}
                    onChange={(e) => setHighlightsInput(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-forest-900 text-white font-bold text-xs py-2.5 rounded-xl"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-400" />
                  <span>{isGenerating ? 'Enhancing with Johar AI & Groq...' : 'Generate Description'}</span>
                </Button>
              </div>

              {/* Generated Output Preview */}
              {generatedResult && (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-amber-300 bg-amber-50/30">
                  <div className="flex items-center justify-between border-b border-ink-200/70 pb-2">
                    <span className="font-bold text-ink-950 text-xs flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>AI Generated Preview</span>
                    </span>
                    <span className="text-[10px] text-forest-700 font-semibold">
                      {generatedResult.modelUsed ? `✦ ${generatedResult.modelUsed}` : 'Review & Edit before applying'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Enhanced Title</p>
                    <p className="font-bold text-ink-900 text-xs">{generatedResult.enhancedTitle}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Short Summary</p>
                    <p className="text-xs text-ink-700">{generatedResult.shortDescription}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Detailed Story</p>
                    <p className="text-xs text-ink-700 leading-relaxed">{generatedResult.detailedDescription}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Suggested Highlights</p>
                    <ul className="list-disc list-inside text-xs text-ink-700 space-y-0.5">
                      {generatedResult.amenitiesOrHighlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-ink-200/70 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApply}
                      className="bg-forest-900 text-white hover:bg-forest-800 font-bold text-xs"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      <span>Apply to Form</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
