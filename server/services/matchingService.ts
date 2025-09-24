import { type Candidate, type Internship, type InternshipMatch } from '@shared/schema';
import { rankInternships } from './gemini';

export class MatchingService {
  
  async findMatches(candidate: Candidate, internships: Internship[]): Promise<InternshipMatch[]> {
    // First pass: Rule-based filtering to get shortlist
    const shortlistMatches: Array<{internship: Internship, basicScore: number, explanation: string}> = [];
    
    for (const internship of internships) {
      const basicMatch = this.calculateBasicMatch(candidate, internship);
      if (basicMatch.matchPercentage >= 50) { // Lower threshold for shortlisting
        shortlistMatches.push({
          internship,
          basicScore: basicMatch.matchPercentage,
          explanation: basicMatch.explanation
        });
      }
    }
    
    // Sort by basic score and take top 20 for Gemini ranking
    const sortedShortlist = shortlistMatches
      .sort((a, b) => b.basicScore - a.basicScore)
      .slice(0, 20);
    
    console.log(`Filtered ${internships.length} internships to ${sortedShortlist.length} for AI ranking`);
    
    try {
      // Second pass: Use Gemini to rank the shortlist
      const rankedResults = await rankInternships(candidate, sortedShortlist.map(m => m.internship));
      
      if (rankedResults && rankedResults.length > 0) {
        return rankedResults.slice(0, 10); // Return top 10 AI-ranked matches
      }
    } catch (error) {
      console.error('Error using Gemini for ranking, falling back to basic matching:', error);
    }
    
    // Fallback: Return basic matches if Gemini fails
    const fallbackMatches = sortedShortlist.slice(0, 10).map(match => ({
      internship: match.internship,
      matchPercentage: match.basicScore,
      aiExplanation: match.explanation
    }));
    
    return fallbackMatches;
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
    // Rules align with server filter: Any Location => always match; Remote only => only Remote; Specific => exact city match
    const wantsAny = candidate.locations.includes('Any Location');
    const wantsOnlyRemote = candidate.locations.length === 1 && candidate.locations[0] === 'Remote';
    const locationMatch = wantsAny
      ? true
      : wantsOnlyRemote
        ? internship.location === 'Remote'
        : candidate.locations.includes(internship.location);
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
    
    const explanation = `${matchingSkills.length} matching skills${locationMatch ? ', location fit' : ''}${sectorMatch ? ', sector match' : ''}.`;
    
    return { matchPercentage, explanation };
  }
}

export const matchingService = new MatchingService();
