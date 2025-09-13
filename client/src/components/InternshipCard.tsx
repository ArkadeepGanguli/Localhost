import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, IndianRupee, ExternalLink, Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { type InternshipMatch } from "@shared/schema";

interface InternshipCardProps {
  match: InternshipMatch;
  language: 'en' | 'hi';
}

export default function InternshipCard({ match, language }: InternshipCardProps) {
  const { internship, matchPercentage, aiExplanation } = match;
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);

  const translations = {
    en: {
      whyFitsYou: "Why this fits you:",
      requiredSkills: "Required Skills:",
      applyNow: "Apply Now",
      save: "Save",
      showMore: "Show more",
      showLess: "Show less"
    },
    hi: {
      whyFitsYou: "यह आपके लिए क्यों उपयुक्त है:",
      requiredSkills: "आवश्यक कौशल:",
      applyNow: "अभी आवेदन करें",
      save: "सेव करें",
      showMore: "और दिखाएं",
      showLess: "कम दिखाएं"
    }
  };

  const t = translations[language];

  // Determine match percentage color
  const getMatchPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-accent text-accent-foreground";
    if (percentage >= 80) return "bg-primary text-primary-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  // Truncate explanation text
  const EXPLANATION_LIMIT = 140;
  const shouldTruncate = aiExplanation.length > EXPLANATION_LIMIT;
  const displayedExplanation = isExplanationExpanded || !shouldTruncate 
    ? aiExplanation 
    : aiExplanation.slice(0, EXPLANATION_LIMIT) + '...';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow" data-testid={`card-internship-${internship.id}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1" data-testid={`text-title-${internship.id}`}>
                  {internship.title}
                </h3>
                <p className="text-base text-gray-600" data-testid={`text-company-${internship.id}`}>
                  {internship.company}
                </p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold" data-testid={`text-match-percentage-${internship.id}`}>
                {matchPercentage}% Match
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
              <span className="flex items-center" data-testid={`text-location-${internship.id}`}>
                <MapPin className="h-4 w-4 mr-1" />
                {internship.location}
              </span>
              {internship.salary && (
                <span className="flex items-center" data-testid={`text-salary-${internship.id}`}>
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {internship.salary}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 italic" data-testid={`text-explanation-${internship.id}`}>
            {displayedExplanation}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mt-2"
              data-testid={`button-toggle-explanation-${internship.id}`}
            >
              {isExplanationExpanded ? (
                <>
                  {t.showLess}
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  {t.showMore}
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {internship.skills.slice(0, 6).map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                data-testid={`tag-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {skill}
              </span>
            ))}
            {internship.skills.length > 6 && (
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs">
                +{internship.skills.length - 6} more
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex-1"
            data-testid={`button-apply-${internship.id}`}
          >
            <a 
              href={internship.applyLink || "https://www.pminternship.gov.in"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t.applyNow}
            </a>
          </Button>
          <Button 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg"
            data-testid={`button-save-${internship.id}`}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
    </div>
  );
}
