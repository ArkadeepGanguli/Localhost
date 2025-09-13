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
import { Search, X } from "lucide-react";
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

  // Fetch available skills
  const { data: skillsData } = useQuery<{ skills: string[] }>({
    queryKey: ['/api/skills'],
  });

  const availableSkills = skillsData?.skills || [];

  const filteredSkills = availableSkills.filter((skill: string) =>
    skill.toLowerCase().includes(skillsSearch.toLowerCase()) &&
    !formData.skills.includes(skill)
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
      findMyMatches: "Find My Matches",
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
      findMyMatches: "मेरे मैच खोजें",
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
    <div className="max-w-4xl mx-auto p-6 bg-background">
      <div className="space-y-8">
        {/* Name and Email - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
              {t.fullName}
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder={t.fullNamePlaceholder}
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="h-12 bg-muted/30 border-border"
              data-testid="input-fullname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              {t.emailAddress}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="h-12 bg-muted/30 border-border"
              data-testid="input-email"
            />
          </div>
        </div>

        {/* Education Level */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t.educationLevel}
          </Label>
          <Select value={formData.education} onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}>
            <SelectTrigger className="h-12 bg-muted/30 border-border" data-testid="select-education">
              <SelectValue placeholder="Bachelor's Degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12th-pass">{t.twelthPass}</SelectItem>
              <SelectItem value="undergraduate">{t.undergraduate}</SelectItem>
              <SelectItem value="postgraduate">{t.postgraduate}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skills & Expertise */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t.skillsExpertise}
          </Label>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={t.skillsPlaceholder}
                value={skillsSearch}
                onChange={(e) => {
                  setSkillsSearch(e.target.value);
                  setShowSkillsDropdown(e.target.value.length > 0);
                }}
                onFocus={() => setShowSkillsDropdown(skillsSearch.length > 0)}
                className="h-12 pl-10 bg-muted/30 border-border"
                data-testid="input-skills-search"
              />
            </div>
            
            {/* Skills Dropdown */}
            {showSkillsDropdown && filteredSkills.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                {filteredSkills.slice(0, 10).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillAdd(skill)}
                    className="w-full px-3 py-2 text-left hover:bg-muted/50 text-sm"
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
                <div
                  key={skill}
                  className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  data-testid={`selected-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {skill}
                  <button
                    onClick={() => handleSkillRemove(skill)}
                    className="hover:bg-primary/80 rounded-full p-0.5"
                    data-testid={`remove-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sector Interests */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">
            {t.sectorInterests}
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sectorOptions.map((sector) => (
              <div key={sector.value} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={sector.value}
                  checked={formData.sectors.includes(sector.value)}
                  onChange={() => handleSectorChange(sector.value)}
                  className="w-4 h-4 text-primary bg-background border-2 border-border rounded focus:ring-primary focus:ring-2"
                  data-testid={`checkbox-sector-${sector.value}`}
                />
                <Label
                  htmlFor={sector.value}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {sector.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Location Preferences */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">
            {t.locationPreferences}
          </Label>
          <RadioGroup 
            value={locationPreference} 
            onValueChange={handleLocationPreferenceChange}
            className="flex flex-col md:flex-row gap-6"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="any" id="any-location" />
              <Label htmlFor="any-location" className="text-sm text-foreground cursor-pointer">
                {t.anyLocation}
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="remote" id="remote-work" />
              <Label htmlFor="remote-work" className="text-sm text-foreground cursor-pointer">
                {t.remoteWork}
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="specific" id="specific-locations" />
              <Label htmlFor="specific-locations" className="text-sm text-foreground cursor-pointer">
                {t.specificLocations}
              </Label>
            </div>
          </RadioGroup>
          
          {locationPreference === 'specific' && (
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
              {t.specificLocationsHint}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
            data-testid="button-find-matches"
          >
            {t.findMyMatches}
          </Button>
        </div>
      </div>
    </div>
  );
}