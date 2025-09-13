import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import MultiStepForm from "@/components/MultiStepForm";
import InternshipCard from "@/components/InternshipCard";
import LanguageToggle from "@/components/LanguageToggle";
import { apiRequest } from "@/lib/queryClient";
import { type InternshipMatch, type CandidateFormData } from "@shared/schema";

type ViewState = 'welcome' | 'form' | 'loading' | 'results';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('welcome');
  const [matches, setMatches] = useState<InternshipMatch[]>([]);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const findMatchesMutation = useMutation({
    mutationFn: async (candidateData: CandidateFormData) => {
      const response = await apiRequest('POST', '/api/matches', candidateData);
      return await response.json();
    },
    onSuccess: (data) => {
      setMatches(data.matches);
      setViewState('results');
    },
    onError: () => {
      setViewState('form');
    }
  });

  const handleFormSubmit = (candidateData: CandidateFormData) => {
    setViewState('loading');
    findMatchesMutation.mutate(candidateData);
  };

  const handleNewSearch = () => {
    setViewState('welcome');
    setMatches([]);
  };

  const translations = {
    en: {
      title: "InternshipInsight",
      subtitle: "PM Internship Scheme",
      findPerfectInternship: "Find Your Perfect Internship",
      answerQuestions: "Answer a few simple questions and we'll match you with internships that fit your skills and interests",
      startMatching: "Start Matching",
      findingMatches: "Finding Perfect Matches...",
      usingAI: "Using AI to analyze your profile and match with suitable internships",
      yourMatches: "Your Internship Matches",
      basedOnProfile: "Based on your profile, here are the best internship opportunities for you:",
      startNewSearch: "Start New Search"
    },
    hi: {
      title: "InternshipInsight",
      subtitle: "PM इंटर्नशिप योजना",
      findPerfectInternship: "अपना सही इंटर्नशिप खोजें",
      answerQuestions: "कुछ सरल प्रश्नों के उत्तर दें और हम आपको आपके कौशल और रुचियों के अनुसार इंटर्नशिप से मिलाएंगे",
      startMatching: "मैचिंग शुरू करें",
      findingMatches: "सही मैच खोज रहे हैं...",
      usingAI: "आपकी प्रोफ़ाइल का विश्लेषण करने और उपयुक्त इंटर्नशिप से मिलाने के लिए AI का उपयोग",
      yourMatches: "आपके इंटर्नशिप मैच",
      basedOnProfile: "आपकी प्रोफ़ाइल के आधार पर, यहाँ आपके लिए सबसे अच्छे इंटर्नशिप अवसर हैं:",
      startNewSearch: "नई खोज शुरू करें"
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">{t.title}</h1>
            </div>
            <LanguageToggle language={language} onToggle={setLanguage} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Welcome Section */}
        {viewState === 'welcome' && (
          <section className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t.findPerfectInternship}
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                {t.answerQuestions}
              </p>
              <Button 
                onClick={() => setViewState('form')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-medium"
                data-testid="button-start-matching"
              >
                {t.startMatching}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </section>
        )}

        {/* Form Section */}
        {viewState === 'form' && (
          <MultiStepForm 
            onSubmit={handleFormSubmit}
            language={language}
            onBack={() => setViewState('welcome')}
          />
        )}

        {/* Loading Section */}
        {viewState === 'loading' && (
          <section className="text-center py-20">
            <div className="max-w-md mx-auto">
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-6 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t.findingMatches}
              </h3>
              <p className="text-gray-600">
                {t.usingAI}
              </p>
            </div>
          </section>
        )}

        {/* Results Section */}
        {viewState === 'results' && (
          <section>
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600 font-medium">Step 3 of 3</span>
                <span className="text-sm text-gray-500">Recommendations Ready</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}} />
              </div>
            </div>
            
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t.yourMatches}
              </h2>
              <p className="text-gray-600 mb-4">
                {t.basedOnProfile}
              </p>
              
              {/* Filter and Count */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    All Matches
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm">
                    90%+ Match
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  Showing {matches.length} of {matches.length} matches
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {matches.map((match, index) => (
                <InternshipCard 
                  key={`${match.internship.id}-${index}`}
                  match={match}
                  language={language}
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button 
                onClick={handleNewSearch}
                variant="secondary"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                data-testid="button-new-search"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t.startNewSearch}
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
