import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, X, ArrowLeft } from "lucide-react";
import { type CandidateFormData } from "@shared/schema";

interface CandidateFormProps {
  onSubmit: (data: CandidateFormData) => void;
  language: 'en' | 'hi';
  onBack: () => void;
}

export default function CandidateForm({ onSubmit, language, onBack }: CandidateFormProps) {
  const [formData, setFormData] = useState<CandidateFormData>({
    fullName: '',
    email: '',
    education: '',
    skills: [],
    sectors: [],
    locations: [],
    language: language
  });

  const [skillsSearch, setSkillsSearch] = useState('');
  const [locationPreference, setLocationPreference] = useState<'any' | 'remote' | 'specific'>('any');
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [locationsSearch, setLocationsSearch] = useState('');
  const [showLocationsDropdown, setShowLocationsDropdown] = useState(false);

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
      specificLocationsHint: "Select 'Specific Locations' to choose cities",
      locationsPlaceholder: "Search and select locations...",
      findMyMatches: "Find My Matches",
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
      fullName: "पूरा नाम",
      fullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
      emailAddress: "ईमेल पता",
      emailPlaceholder: "your.email@domain.com", 
      educationLevel: "शिक्षा स्तर",
      skillsExpertise: "कौशल और विशेषज्ञता",
      skillsPlaceholder: "अपने कौशल खोजें और चुनें...",
      sectorInterests: "क्षेत्र की रुचियां",
      locationPreferences: "स्थान की प्राथमिकताएं",
      anyLocation: "कोई भी स्थान",
      remoteWork: "रिमोट कार्य",
      specificLocations: "विशिष्ट स्थान",
      specificLocationsHint: "शहर चुनने के लिए 'विशिष्ट स्थान' चुनें",
      locationsPlaceholder: "स्थान खोजें और चुनें...",
      findMyMatches: "मेरे मैच खोजें",
      back: "वापस",
      twelthPass: "12वीं पास / इंटरमीडिएट", 
      undergraduate: "स्नातक की डिग्री",
      postgraduate: "स्नातकोत्तर की डिग्री",
      sectors: {
        technology: "प्रौद्योगिकी",
        marketing: "मार्केटिंग", 
        finance: "वित्त",
        design: "डिज़ाइन",
        sales: "सेल्स",
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
    { value: 'marketing', label: t.sectors.marketing },
    { value: 'finance', label: t.sectors.finance },
    { value: 'design', label: t.sectors.design },
    { value: 'sales', label: t.sectors.sales },
    { value: 'operations', label: t.sectors.operations },
    { value: 'healthcare', label: t.sectors.healthcare },
    { value: 'education', label: t.sectors.education },
    { value: 'manufacturing', label: t.sectors.manufacturing },
    { value: 'consulting', label: t.sectors.consulting }
  ];

  const handleSkillAdd = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillsSearch('');
      setShowSkillsDropdown(false);
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleLocationAdd = (location: string) => {
    if (!formData.locations.includes(location)) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, location]
      }));
      setLocationsSearch('');
      setShowLocationsDropdown(false);
    }
  };

  const handleLocationRemove = (locationToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(location => location !== locationToRemove)
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

  const handleLocationPreferenceChange = (value: string) => {
    const preference = value as 'any' | 'remote' | 'specific';
    setLocationPreference(preference);
    
    // Update form data based on preference
    let locations: string[] = [];
    if (preference === 'any') {
      locations = ['Any Location'];
    } else if (preference === 'remote') {
      locations = ['Remote'];
    }
    // For specific locations, keep current selections or empty array
    else {
      locations = formData.locations.filter(loc => loc !== 'Any Location' && loc !== 'Remote');
    }
    
    setFormData(prev => ({
      ...prev,
      locations
    }));
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit(formData);
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.education !== '' &&
      formData.skills.length > 0 &&
      formData.sectors.length > 0 &&
      formData.locations.length > 0
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-8 space-y-6">
        {/* Back Button */}
        <div className="flex items-center mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800 p-2 -ml-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.back}
          </Button>
        </div>
        {/* Name and Email */}
        <div className="space-y-4">
          <div>
            <Input
              id="fullName"
              type="text"
              placeholder={t.fullNamePlaceholder}
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-fullname"
            />
          </div>
          <div>
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-email"
            />
          </div>
        </div>

        {/* Education Level */}
        <div>
          <Select value={formData.education} onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}>
            <SelectTrigger className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500" data-testid="select-education">
              <SelectValue placeholder={t.educationLevel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12th-pass">{t.twelthPass}</SelectItem>
              <SelectItem value="undergraduate">{t.undergraduate}</SelectItem>
              <SelectItem value="postgraduate">{t.postgraduate}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skills */}
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={t.skillsPlaceholder}
              value={skillsSearch}
              onChange={(e) => {
                setSkillsSearch(e.target.value);
                setShowSkillsDropdown(e.target.value.length > 0);
              }}
              onFocus={() => setShowSkillsDropdown(skillsSearch.length > 0)}
              className="h-12 pl-10 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-skills-search"
            />
            
            {/* Skills Dropdown */}
            {showSkillsDropdown && filteredSkills.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                {filteredSkills.slice(0, 10).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillAdd(skill)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
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

        {/* Sectors */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">{t.sectorInterests}</p>
          <div className="grid grid-cols-2 gap-3">
            {sectorOptions.map((sector) => (
              <label
                key={sector.value}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  formData.sectors.includes(sector.value)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.sectors.includes(sector.value)}
                  onChange={() => handleSectorChange(sector.value)}
                  className="sr-only"
                  data-testid={`checkbox-sector-${sector.value}`}
                />
                <span className="text-sm font-medium">{sector.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">{t.locationPreferences}</p>
          <div className="grid grid-cols-1 gap-2">
            {[{value: 'any', label: t.anyLocation}, {value: 'remote', label: t.remoteWork}, {value: 'specific', label: t.specificLocations}].map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  locationPreference === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="location"
                  value={option.value}
                  checked={locationPreference === option.value}
                  onChange={(e) => handleLocationPreferenceChange(e.target.value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
          
          {/* Specific Locations Selection */}
          {locationPreference === 'specific' && (
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder={t.locationsPlaceholder}
                  value={locationsSearch}
                  onChange={(e) => {
                    setLocationsSearch(e.target.value);
                    setShowLocationsDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowLocationsDropdown(locationsSearch.length > 0)}
                  className="h-12 pl-10 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="input-locations-search"
                />
                
                {/* Locations Dropdown */}
                {showLocationsDropdown && filteredLocations.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                    {filteredLocations.slice(0, 10).map((location) => (
                      <button
                        key={location}
                        onClick={() => handleLocationAdd(location)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                        data-testid={`option-location-${location.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Selected Locations */}
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

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className={`w-full h-12 font-medium text-base rounded-lg transition-colors ${
              isFormValid() 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            data-testid="button-find-matches"
          >
            {t.findMyMatches}
          </Button>
        </div>
      </div>
    </div>
  );
}