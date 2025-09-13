import { type Candidate, type Internship, type InternshipMatch } from '@shared/schema';
import { generateInternshipMatch } from './gemini';

export class MatchingService {
  
  async findMatches(candidate: Candidate, internships: Internship[]): Promise<InternshipMatch[]> {
    const matches: InternshipMatch[] = [];
    
    for (const internship of internships) {
      try {
        const matchData = await generateInternshipMatch(candidate, internship);
        
        if (matchData && matchData.matchPercentage >= 60) { // Only include matches above 60%
          matches.push({
            internship,
            matchPercentage: matchData.matchPercentage,
            aiExplanation: matchData.explanation
          });
        }
      } catch (error) {
        console.error(`Error generating match for internship ${internship.id}:`, error);
        // Fallback to basic matching if AI fails
        const basicMatch = this.calculateBasicMatch(candidate, internship);
        if (basicMatch.matchPercentage >= 60) {
          matches.push({
            internship,
            matchPercentage: basicMatch.matchPercentage,
            aiExplanation: basicMatch.explanation
          });
        }
      }
    }
    
    // Sort by match percentage descending and return at least 5 matches
    const sortedMatches = matches
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    // Return at least 5 matches, more if available and high quality
    return sortedMatches.slice(0, Math.max(5, sortedMatches.length));
  }

  private calculateBasicMatch(candidate: Candidate, internship: Internship): { matchPercentage: number; explanation: string } {
    let totalScore = 0;
    let maxScore = 0;
    
    // Skills matching (40% weight)
    const skillsWeight = 40;
    const matchingSkills = candidate.skills.filter(skill => 
      internship.skills.some(intSkill => 
        intSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(intSkill.toLowerCase())
      )
    );
    const skillsScore = (matchingSkills.length / Math.max(candidate.skills.length, 1)) * skillsWeight;
    totalScore += skillsScore;
    maxScore += skillsWeight;
    
    // Location matching (30% weight)
    const locationWeight = 30;
    const locationMatch = candidate.locations.includes(internship.location) || 
                         internship.location === "Remote" ||
                         candidate.locations.includes("Remote");
    const locationScore = locationMatch ? locationWeight : 0;
    totalScore += locationScore;
    maxScore += locationWeight;
    
    // Sector matching (30% weight)  
    const sectorWeight = 30;
    const sectorMatch = candidate.sectors.some(sector => 
      internship.sector?.toLowerCase().includes(sector.toLowerCase()) ||
      sector.toLowerCase().includes(internship.sector?.toLowerCase() || "")
    );
    const sectorScore = sectorMatch ? sectorWeight : 0;
    totalScore += sectorScore;
    maxScore += sectorWeight;
    
    const matchPercentage = Math.round((totalScore / maxScore) * 100);
    
    const explanation = `This role matches ${matchingSkills.length} of your key skills` +
      (locationMatch ? ` and aligns with your location preferences` : '') +
      (sectorMatch ? ` in your preferred sector` : '') +
      `. It offers relevant experience for your career goals.`;
    
    return { matchPercentage, explanation };
  }
}

export const matchingService = new MatchingService();
