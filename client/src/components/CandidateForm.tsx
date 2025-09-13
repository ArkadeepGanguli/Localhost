import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Wrench, 
  Briefcase, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Search,
  Wand2,
  X
} from "lucide-react";
import { type CandidateFormData } from "@shared/schema";

interface CandidateFormProps {
  onSubmit: (data: CandidateFormData) => void;
  language: 'en' | 'hi';
  onBack: () => void;
}

export default function CandidateForm({ onSubmit, language, onBack }: CandidateFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CandidateFormData>({
    education: '',
    skills: [],
    sectors: [],
    locations: [],
    language: language
  });

  const [skillsSearch, setSkillsSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Fetch available skills
  const { data: skillsData } = useQuery({
    queryKey: ['/api/skills'],
  });

  // Fetch available locations  
  const { data: locationsData } = useQuery({
    queryKey: ['/api/locations'],
  });

  const translations = {
    en: {
      progress: "Progress",
      educationLevel: "Education Level",
      twelthPass: "12th Pass / Intermediate",
      undergraduate: "Undergraduate (Pursuing/Completed)",
      postgraduate: "Postgraduate (Pursuing/Completed)",
      yourSkills: "Your Skills",
      searchSkills: "Search and select your skills:",
      typeToSearch: "Type to search skills...",
      selectedSkills: "Selected Skills:",
      noSkillsSelected: "No skills selected",
      sectorInterests: "Sector Interests",
      informationTechnology: "Information Technology",
      marketingSales: "Marketing & Sales",
      designCreative: "Design & Creative",
      financeAccounting: "Finance & Accounting",
      operationsManagement: "Operations & Management",
      contentMedia: "Content & Media",
      locationPreferences: "Location Preferences",
      searchLocations: "Search preferred locations:",
      typeLocationSearch: "Type city, state or 'Remote'",
      selectedLocations: "Selected Locations:",
      noLocationsSelected: "No locations selected",
      next: "Next",
      previous: "Previous",
      findMatches: "Find Matches"
    },
    hi: {
      progress: "प्रगति",
      educationLevel: "शिक्षा स्तर",
      twelthPass: "12वीं पास / इंटरमीडिएट",
      undergraduate: "स्नातक (जारी/पूर्ण)",
      postgraduate: "स्नातकोत्तर (जारी/पूर्ण)",
      yourSkills: "आपके कौशल",
      searchSkills: "अपने कौशल खोजें और चुनें:",
      typeToSearch: "कौशल खोजने के लिए टाइप करें...",
      selectedSkills: "चयनित कौशल:",
      noSkillsSelected: "कोई कौशल चयनित नहीं",
      sectorInterests: "क्षेत्र की रुचियां",
      informationTechnology: "सूचना प्रौद्योगिकी",
      marketingSales: "मार्केटिंग और सेल्स",
      designCreative: "डिज़ाइन और रचनात्मक",
      financeAccounting: "वित्त और लेखांकन",
      operationsManagement: "संचालन और प्रबंधन",
      contentMedia: "कंटेंट और मीडिया",
      locationPreferences: "स्थान की प्राथमिकताएं",
      searchLocations: "पसंदीदा स्थान खोजें:",
      typeLocationSearch: "शहर, राज्य या 'Remote' टाइप करें",
      selectedLocations: "चयनित स्थान:",
      noLocationsSelected: "कोई स्थान चयनित नहीं",
      next: "अगला",
      previous: "पिछला",
      findMatches: "मैच खोजें"
    }
  };

  const t = translations[language];
  
  const availableSkills = skillsData?.skills || [];
  const availableLocations = locationsData?.locations || [];

  const filteredSkills = availableSkills.filter((skill: string) =>
    skill.toLowerCase().includes(skillsSearch.toLowerCase()) &&
    !formData.skills.includes(skill)
  );

  const filteredLocations = availableLocations.filter((location: string) =>
    location.toLowerCase().includes(locationSearch.toLowerCase()) &&
    !formData.locations.includes(location)
  );

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.education !== '';
      case 2:
        return formData.skills.length > 0;
      case 3:
        return formData.sectors.length > 0;
      case 4:
        return formData.locations.length > 0;
      default:
        return true;
    }
  };

  const handleEducationChange = (education: string) => {
    setFormData(prev => ({ ...prev, education }));
  };

  const handleSectorChange = (sector: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sectors: checked
        ? [...prev.sectors, sector]
        : prev.sectors.filter(s => s !== sector)
    }));
  };

  const addSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skill]
    }));
    setSkillsSearch('');
    setShowSkillsDropdown(false);
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, location]
    }));
    setLocationSearch('');
    setShowLocationDropdown(false);
  };

  const removeLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }));
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit({ ...formData, language });
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{t.progress}</span>
                <span data-testid="text-progress">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Education */}
      {currentStep === 1 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <GraduationCap className="text-primary mr-3 h-5 w-5" />
              {t.educationLevel}
            </h3>
            
            <div className="space-y-3">
              {[
                { value: '12th', label: t.twelthPass },
                { value: 'ug', label: t.undergraduate },
                { value: 'pg', label: t.postgraduate }
              ].map(({ value, label }) => (
                <label 
                  key={value}
                  className="flex items-center p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="education"
                    value={value}
                    checked={formData.education === value}
                    onChange={(e) => handleEducationChange(e.target.value)}
                    className="mr-3 text-primary"
                    data-testid={`input-education-${value}`}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <Button 
                variant="secondary" 
                onClick={onBack}
                data-testid="button-back-to-welcome"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!validateCurrentStep()}
                data-testid="button-next-step"
              >
                {t.next}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Skills */}
      {currentStep === 2 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Wrench className="text-primary mr-3 h-5 w-5" />
              {t.yourSkills}
            </h3>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-foreground mb-2">
                {t.searchSkills}
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={skillsSearch}
                  onChange={(e) => {
                    setSkillsSearch(e.target.value);
                    setShowSkillsDropdown(e.target.value.length > 0);
                  }}
                  placeholder={t.typeToSearch}
                  className="w-full"
                  data-testid="input-skills-search"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {showSkillsDropdown && filteredSkills.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-input rounded-lg bg-popover mb-4">
                {filteredSkills.map((skill: string) => (
                  <div
                    key={skill}
                    className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                    onClick={() => addSkill(skill)}
                    data-testid={`option-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                {t.selectedSkills}
              </Label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-input rounded-lg bg-muted/30">
                {formData.skills.length === 0 ? (
                  <span className="text-sm text-muted-foreground">{t.noSkillsSelected}</span>
                ) : (
                  formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="skill-tag"
                      data-testid={`tag-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:bg-primary-foreground hover:text-primary rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        data-testid={`button-remove-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button 
                variant="secondary" 
                onClick={handlePrev}
                data-testid="button-prev-step"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.previous}
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!validateCurrentStep()}
                data-testid="button-next-step"
              >
                {t.next}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Sectors */}
      {currentStep === 3 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Briefcase className="text-primary mr-3 h-5 w-5" />
              {t.sectorInterests}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'IT', label: t.informationTechnology },
                { value: 'Marketing', label: t.marketingSales },
                { value: 'Design', label: t.designCreative },
                { value: 'Finance', label: t.financeAccounting },
                { value: 'Operations', label: t.operationsManagement },
                { value: 'Content', label: t.contentMedia }
              ].map(({ value, label }) => (
                <label 
                  key={value}
                  className="flex items-center p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    name="sectors"
                    value={value}
                    checked={formData.sectors.includes(value)}
                    onChange={(e) => handleSectorChange(value, e.target.checked)}
                    className="mr-3 text-primary"
                    data-testid={`input-sector-${value.toLowerCase()}`}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <Button 
                variant="secondary" 
                onClick={handlePrev}
                data-testid="button-prev-step"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.previous}
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!validateCurrentStep()}
                data-testid="button-next-step"
              >
                {t.next}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Locations */}
      {currentStep === 4 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <MapPin className="text-primary mr-3 h-5 w-5" />
              {t.locationPreferences}
            </h3>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-foreground mb-2">
                {t.searchLocations}
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setShowLocationDropdown(e.target.value.length > 0);
                  }}
                  placeholder={t.typeLocationSearch}
                  className="w-full"
                  data-testid="input-location-search"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {showLocationDropdown && filteredLocations.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-input rounded-lg bg-popover mb-4">
                {filteredLocations.map((location: string) => (
                  <div
                    key={location}
                    className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                    onClick={() => addLocation(location)}
                    data-testid={`option-location-${location.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                {t.selectedLocations}
              </Label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-input rounded-lg bg-muted/30">
                {formData.locations.length === 0 ? (
                  <span className="text-sm text-muted-foreground">{t.noLocationsSelected}</span>
                ) : (
                  formData.locations.map((location) => (
                    <span
                      key={location}
                      className="location-tag"
                      data-testid={`tag-location-${location.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {location}
                      <button
                        onClick={() => removeLocation(location)}
                        className="ml-2 hover:bg-primary-foreground hover:text-primary rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        data-testid={`button-remove-location-${location.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button 
                variant="secondary" 
                onClick={handlePrev}
                data-testid="button-prev-step"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.previous}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!validateCurrentStep()}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                data-testid="button-find-matches"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {t.findMatches}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
