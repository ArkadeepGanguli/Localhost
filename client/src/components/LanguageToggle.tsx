import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  language: 'en' | 'hi';
  onToggle: (language: 'en' | 'hi') => void;
}

export default function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onToggle(language === 'en' ? 'hi' : 'en')}
      className="bg-primary-foreground bg-opacity-20 hover:bg-opacity-30 text-primary-foreground"
      data-testid="button-language-toggle"
    >
      <Globe className="h-4 w-4 mr-1" />
      {language === 'en' ? 'हिंदी' : 'English'}
    </Button>
  );
}
