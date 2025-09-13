import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import CandidateForm from "@/components/CandidateForm";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-6 w-6" />
              <div>
                <h1 className="text-lg font-bold">{t.title}</h1>
                <p className="text-xs opacity-90">{t.subtitle}</p>
              </div>
            </div>
            <LanguageToggle language={language} onToggle={setLanguage} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Welcome Section */}
        {viewState === 'welcome' && (
          <section className="text-center mb-8">
            <Card>
              <CardContent className="p-6">
                <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {t.findPerfectInternship}
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t.answerQuestions}
                </p>
                <Button 
                  onClick={() => setViewState('form')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid="button-start-matching"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t.startMatching}
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Form Section */}
        {viewState === 'form' && (
          <CandidateForm 
            onSubmit={handleFormSubmit}
            language={language}
            onBack={() => setViewState('welcome')}
          />
        )}

        {/* Loading Section */}
        {viewState === 'loading' && (
          <section className="text-center py-12">
            <Card>
              <CardContent className="p-8">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t.findingMatches}
                </h3>
                <p className="text-muted-foreground">
                  {t.usingAI}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Results Section */}
        {viewState === 'results' && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t.yourMatches}
              </h2>
              <p className="text-muted-foreground">
                {t.basedOnProfile}
              </p>
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
