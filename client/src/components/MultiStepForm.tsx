import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, X, ArrowLeft, ArrowRight } from "lucide-react";
import { type CandidateFormData } from "@shared/schema";

interface MultiStepFormProps {
  onSubmit: (data: CandidateFormData) => void;
  language: 'en' | 'hi';
  onBack: () => void;
}

export default function MultiStepForm({ onSubmit, language, onBack }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CandidateFormData>({
    fullName: '',
    email: '',
    education: 'undergraduate', // Default to Bachelor's Degree
    skills: [],
    sectors: [],
    locations: [],
    language: language
  });

  const [skillsSearch, setSkillsSearch] = useState('');
  const [locationPreference, setLocationPreference] = useState<'any' | 'remote' | 'specific' | ''>(''); // No default selection
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [highlightedSkillIndex, setHighlightedSkillIndex] = useState(0);
  const skillsInputRef = useRef<HTMLInputElement>(null);
  const [locationsSearch, setLocationsSearch] = useState('');
  const [showLocationsDropdown, setShowLocationsDropdown] = useState(false);
  const [highlightedLocationIndex, setHighlightedLocationIndex] = useState(0);
  const locationsInputRef = useRef<HTMLInputElement>(null);

  // Fetch available skills
  const { data: skillsData } = useQuery<{ skills: string[] }>({
    queryKey: ['/api/skills'],
  });

  // Fetch available locations  
  const { data: locationsData } = useQuery<{ locations: string[] }>({
    queryKey: ['/api/locations'],
  });

  const availableSkills = skillsData?.skills || [];
  const availableLocations = locationsData?.locations || [];

  const filteredSkills = availableSkills.filter((skill: string) =>
    skill.toLowerCase().includes(skillsSearch.toLowerCase()) &&
    !formData.skills.includes(skill)
  );
  const filteredLocations = availableLocations.filter((location: string) =>
    location.toLowerCase().includes(locationsSearch.toLowerCase()) &&
    !formData.locations.includes(location)
  );

  const translations = {
    en: {
      profileSetup: "Profile Setup",
      tellUsAboutYourself: "Tell us about yourself",
      helpFindPerfect: "Help us find the perfect internship opportunities for you",
      fullName: "Full Name",
      fullNamePlaceholder: "Enter your full name",
      emailAddress: "Email Address", 
      emailPlaceholder: "your.email@domain.com",
      educationLevel: "Education Level",
      skillsExpertise: "Skills & Expertise",
      skillsPlaceholder: "Search and select your skills...",
      sectorInterests: "Sector Interests",
      locationPreferences: "Location Preferences",
      anyLocation: "Any Location",
      remoteWork: "Remote Work", 
      specificLocations: "Specific Locations",
  locationsPlaceholder: "Search and select locations...",
      findMyMatches: "Find My Matches",
      next: "Next",
      back: "Back",
      twelthPass: "12th Pass / Intermediate",
      undergraduate: "Bachelor's Degree",
      postgraduate: "Master's Degree",
      sectors: {
        technology: "Technology",
        marketing: "Marketing",
        finance: "Finance",
        design: "Design",
        sales: "Sales",
        operations: "Operations",
        healthcare: "Healthcare",
        education: "Education",
        manufacturing: "Manufacturing",
        consulting: "Consulting"
      }
    },
    hi: {
      profileSetup: "प्रोफ़ाइल सेटअप",
      tellUsAboutYourself: "हमें अपने बारे में बताएं",
      helpFindPerfect: "हमें आपके लिए सही इंटर्नशिप के अवसर खोजने में मदद करें",
      fullName: "पूरा नाम",
      fullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
      emailAddress: "ईमेल पता",
      emailPlaceholder: "your.email@domain.com",
      educationLevel: "शिक्षा स्तर",
      skillsExpertise: "कौशल और विशेषज्ञता",
      skillsPlaceholder: "अपने कौशल खोजें और चुनें...",
      sectorInterests: "क्षेत्रीय रुचियां",
      locationPreferences: "स्थान प्राथमिकताएं",
      anyLocation: "कोई भी स्थान",
      remoteWork: "रिमोट वर्क",
      specificLocations: "विशिष्ट स्थान",
  locationsPlaceholder: "स्थान खोजें और चुनें...",
      findMyMatches: "मेरे मैच खोजें",
      next: "अगला",
      back: "वापस",
      twelthPass: "12वीं पास / इंटरमीडिएट",
      undergraduate: "स्नातक की डिग्री",
      postgraduate: "स्नातकोत्तर की डिग्री",
      sectors: {
        technology: "तकनीक",
        marketing: "मार्केटिंग",
        finance: "वित्त",
        design: "डिज़ाइन",
        sales: "बिक्री",
        operations: "संचालन",
        healthcare: "स्वास्थ्य सेवा",
        education: "शिक्षा",
        manufacturing: "विनिर्माण",
        consulting: "सलाहकार"
      }
    }
  };

  const t = translations[language];

  const sectorOptions = [
    { value: 'technology', label: t.sectors.technology },
    { value: 'design', label: t.sectors.design },
    { value: 'healthcare', label: t.sectors.healthcare },
    { value: 'consulting', label: t.sectors.consulting },
    { value: 'marketing', label: t.sectors.marketing },
    { value: 'sales', label: t.sectors.sales },
    { value: 'education', label: t.sectors.education },
    { value: 'operations', label: t.sectors.operations },
    { value: 'finance', label: t.sectors.finance },
    { value: 'manufacturing', label: t.sectors.manufacturing }
  ];

  const handleSkillAdd = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
    setSkillsSearch('');
    setShowSkillsDropdown(false);
    setHighlightedSkillIndex(0);
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (!showSkillsDropdown || filteredSkills.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedSkillIndex(prev => 
          prev < filteredSkills.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedSkillIndex(prev => 
          prev > 0 ? prev - 1 : filteredSkills.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredSkills[highlightedSkillIndex]) {
          handleSkillAdd(filteredSkills[highlightedSkillIndex]);
        }
        break;
      case 'Escape':
        setShowSkillsDropdown(false);
        setHighlightedSkillIndex(0);
        break;
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSectorChange = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  const handleLocationPreferenceChange = (value: 'any' | 'remote' | 'specific') => {
    setLocationPreference(value);
    
    // Update form data based on preference
    let locations: string[] = [];
    if (value === 'any') {
      locations = ['Any Location'];
    } else if (value === 'remote') {
      locations = ['Remote'];
    } else if (value === 'specific') {
      locations = [];
    }
    // For specific locations, keep current selections or empty array
    
    setFormData(prev => ({
      ...prev,
      locations
    }));
  };

  const handleLocationAdd = (location: string) => {
    if (!formData.locations.includes(location)) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, location]
      }));
    }
    setLocationsSearch('');
    setShowLocationsDropdown(false);
    setHighlightedLocationIndex(0);
  };

  const handleLocationRemove = (locationToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc !== locationToRemove)
    }));
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (!showLocationsDropdown || filteredLocations.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedLocationIndex(prev =>
          prev < filteredLocations.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedLocationIndex(prev =>
          prev > 0 ? prev - 1 : filteredLocations.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredLocations[highlightedLocationIndex]) {
          handleLocationAdd(filteredLocations[highlightedLocationIndex]);
        }
        break;
      case 'Escape':
        setShowLocationsDropdown(false);
        setHighlightedLocationIndex(0);
        break;
    }
  };

  const isStep1Valid = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.education !== '' &&
      formData.skills.length > 0 &&
      formData.sectors.length > 0
    );
  };

  const isStep2Valid = () => {
    if (locationPreference === 'any') return true;
    if (locationPreference === 'remote') return true;
    if (locationPreference === 'specific') return formData.locations.length > 0;
    return false;
  };

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isStep2Valid()) {
      onSubmit(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBack();
    }
  };

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-blue-600 font-medium">Step {currentStep} of 2</span>
        <span className="text-sm text-gray-500">{t.profileSetup}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 2) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white">
      <div className="p-8">
        <StepIndicator />

        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t.tellUsAboutYourself}
              </h2>
              <p className="text-gray-600">
                {t.helpFindPerfect}
              </p>
            </div>

            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  {t.fullName}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t.fullNamePlaceholder}
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="input-fullname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t.emailAddress}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="input-email"
                />
              </div>
            </div>

            {/* Education Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t.educationLevel}
              </Label>
              <Select 
                value={formData.education} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}
              >
                <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" data-testid="select-education">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12th-pass">{t.twelthPass}</SelectItem>
                  <SelectItem value="undergraduate">{t.undergraduate}</SelectItem>
                  <SelectItem value="postgraduate">{t.postgraduate}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t.skillsExpertise}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  ref={skillsInputRef}
                  type="text"
                  placeholder={t.skillsPlaceholder}
                  value={skillsSearch}
                  onChange={(e) => {
                    setSkillsSearch(e.target.value);
                    setShowSkillsDropdown(e.target.value.length > 0);
                    setHighlightedSkillIndex(0);
                  }}
                  onFocus={() => setShowSkillsDropdown(skillsSearch.length > 0)}
                  onBlur={() => setTimeout(() => setShowSkillsDropdown(false), 200)}
                  onKeyDown={handleSkillKeyDown}
                  className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="input-skills-search"
                />
                
                {/* Skills Dropdown */}
                {showSkillsDropdown && filteredSkills.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-1">
                    {filteredSkills.slice(0, 10).map((skill, index) => (
                      <button
                        key={skill}
                        onClick={() => handleSkillAdd(skill)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0 ${
                          index === highlightedSkillIndex ? 'bg-yellow-100' : ''
                        }`}
                        data-testid={`option-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Selected Skills */}
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      data-testid={`selected-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {skill}
                      <button
                        onClick={() => handleSkillRemove(skill)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                        data-testid={`remove-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sector Interests */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                {t.sectorInterests}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sectorOptions.map((sector) => (
                  <label
                    key={sector.value}
                    className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.sectors.includes(sector.value)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.sectors.includes(sector.value)}
                      onChange={() => handleSectorChange(sector.value)}
                      className="sr-only"
                      data-testid={`checkbox-sector-${sector.value}`}
                    />
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full border-2 mx-auto mb-2 ${
                        formData.sectors.includes(sector.value)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.sectors.includes(sector.value) && (
                          <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium">{sector.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Location Preferences
              </h2>
              <p className="text-gray-600">
                Where would you like to work?
              </p>
            </div>

            {/* Location Preferences */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                {t.locationPreferences}
              </Label>
              <div className="space-y-3">
                {[
                  {value: 'any', label: t.anyLocation}, 
                  {value: 'remote', label: t.remoteWork}, 
                  {value: 'specific', label: t.specificLocations}
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      locationPreference === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 ${
                      locationPreference === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {locationPreference === option.value && (
                        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="location"
                      value={option.value}
                      checked={locationPreference === option.value}
                      onChange={(e) => handleLocationPreferenceChange(e.target.value as 'any' | 'remote' | 'specific')}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
              
              {locationPreference === 'specific' && (
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      ref={locationsInputRef}
                      type="text"
                      placeholder={t.locationsPlaceholder}
                      value={locationsSearch}
                      onChange={(e) => {
                        setLocationsSearch(e.target.value);
                        setShowLocationsDropdown(e.target.value.length > 0);
                        setHighlightedLocationIndex(0);
                      }}
                      onFocus={() => setShowLocationsDropdown(locationsSearch.length > 0)}
                      onBlur={() => setTimeout(() => setShowLocationsDropdown(false), 200)}
                      onKeyDown={handleLocationKeyDown}
                      className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      data-testid="input-locations-search"
                    />

                    {showLocationsDropdown && filteredLocations.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-56 overflow-y-auto mt-1">
                        {filteredLocations.slice(0, 12).map((location, index) => (
                          <button
                            key={location}
                            onClick={() => handleLocationAdd(location)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0 ${
                              index === highlightedLocationIndex ? 'bg-yellow-100' : ''
                            }`}
                            data-testid={`option-location-${location.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.locations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.locations.map((location) => (
                        <span
                          key={location}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          data-testid={`selected-location-${location.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {location}
                          <button
                            onClick={() => handleLocationRemove(location)}
                            className="hover:bg-green-200 rounded-full p-0.5"
                            data-testid={`remove-location-${location.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="flex items-center"
            data-testid="button-previous"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.back}
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentStep === 1 ? !isStep1Valid() : !isStep2Valid()}
            className={`flex items-center px-6 py-2 rounded-lg font-medium ${
              (currentStep === 1 ? isStep1Valid() : isStep2Valid())
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            data-testid="button-next"
          >
            {currentStep === 2 ? t.findMyMatches : t.next}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}