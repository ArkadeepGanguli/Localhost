import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, IndianRupee, ExternalLink, Bookmark } from "lucide-react";
import { type InternshipMatch } from "@shared/schema";

interface InternshipCardProps {
  match: InternshipMatch;
  language: 'en' | 'hi';
}

export default function InternshipCard({ match, language }: InternshipCardProps) {
  const { internship, matchPercentage, aiExplanation } = match;

  const translations = {
    en: {
      whyFitsYou: "Why this fits you:",
      requiredSkills: "Required Skills:",
      applyNow: "Apply Now",
      save: "Save"
    },
    hi: {
      whyFitsYou: "यह आपके लिए क्यों उपयुक्त है:",
      requiredSkills: "आवश्यक कौशल:",
      applyNow: "अभी आवेदन करें",
      save: "सेव करें"
    }
  };

  const t = translations[language];

  // Determine match percentage color
  const getMatchPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-accent text-accent-foreground";
    if (percentage >= 80) return "bg-primary text-primary-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <Card className="match-card" data-testid={`card-internship-${internship.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-foreground mb-1" data-testid={`text-title-${internship.id}`}>
                {internship.title}
              </h3>
              <p className="text-sm font-medium text-muted-foreground" data-testid={`text-company-${internship.id}`}>
                {internship.company}
              </p>
            </div>
            <div className="flex items-center space-x-3 mb-2">
              <Badge 
                className={`${getMatchPercentageColor(matchPercentage)} text-sm px-2 py-1 rounded-full font-medium`}
                data-testid={`text-match-percentage-${internship.id}`}
              >
                {matchPercentage}% Match
              </Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-3">
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
          <h4 className="text-sm font-medium text-foreground mb-2">
            {t.whyFitsYou}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-explanation-${internship.id}`}>
            {aiExplanation}
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">
            {t.requiredSkills}
          </h4>
          <div className="flex flex-wrap gap-2">
            {internship.skills.map((skill, index) => (
              <Badge
                key={`${skill}-${index}`}
                variant="outline"
                className="skill-match text-xs"
                data-testid={`tag-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid={`button-apply-${internship.id}`}
          >
            <a 
              href={internship.applyLink || "https://www.pminternship.gov.in"} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t.applyNow}
            </a>
          </Button>
          <Button 
            variant="outline"
            className="bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/20"
            data-testid={`button-save-${internship.id}`}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            {t.save}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
