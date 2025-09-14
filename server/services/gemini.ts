import { GoogleGenAI } from "@google/genai";
import { type Candidate, type Internship, type InternshipMatch } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "AIzaSyDDGjL3v0zdZLmu4VYLi7iqZ8SZv13gszY" 
});

export interface InternshipMatchResult {
  matchPercentage: number;
  explanation: string;
}

export async function generateInternshipMatch(
  candidate: Candidate, 
  internship: Internship
): Promise<InternshipMatchResult | null> {
  try {
    const systemPrompt = `You are an expert career counselor and internship matching specialist. 
    
Your task is to analyze a candidate's profile against an internship opportunity and provide:
1. A match percentage (0-100) based on skill overlap, location compatibility, education level, and sector alignment
2. A detailed explanation of why this internship is suitable for the candidate

Scoring Guidelines:
- Skills match (40%): How well candidate's skills align with required skills
- Location compatibility (25%): Geographic preference alignment or remote work options  
- Education level (20%): Whether candidate meets education requirements
- Sector interest (15%): How well the internship aligns with candidate's sector preferences

Provide practical, encouraging explanations that highlight:
- Specific skill matches and transferable skills
- Growth opportunities and learning potential
- Location/work arrangement benefits
- How this fits their career goals

Be honest about match quality but focus on positive aspects and potential.
Respond with JSON in this exact format: 
{"matchPercentage": number, "explanation": string}`;

    const candidateProfile = `
Candidate Profile:
- Education: ${candidate.education}
- Skills: ${candidate.skills.join(', ')}
- Sector Interests: ${candidate.sectors.join(', ')}
- Location Preferences: ${candidate.locations.join(', ')}
- Language: ${candidate.language || 'en'}
`;

    const internshipDetails = `
Internship Details:
- Title: ${internship.title}
- Company: ${internship.company}
- Location: ${internship.location}
- Required Skills: ${internship.skills.join(', ')}
- Sector: ${internship.sector || 'Not specified'}
- Salary: ${internship.salary || 'Not specified'}
- Description: ${internship.description || 'Not provided'}
`;

    const prompt = `${candidateProfile}\n${internshipDetails}\n\nAnalyze this match and provide your assessment.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            matchPercentage: { 
              type: "number",
              minimum: 0,
              maximum: 100
            },
            explanation: { 
              type: "string",
              minLength: 50,
              maxLength: 300
            }
          },
          required: ["matchPercentage", "explanation"]
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    console.log(`Gemini AI Response: ${rawJson}`);

    if (rawJson) {
      const data: InternshipMatchResult = JSON.parse(rawJson);
      
      // Validate the response
      if (typeof data.matchPercentage === 'number' && 
          data.matchPercentage >= 0 && 
          data.matchPercentage <= 100 &&
          typeof data.explanation === 'string' &&
          data.explanation.length > 10) {
        return data;
      } else {
        throw new Error("Invalid response format from Gemini AI");
      }
    } else {
      throw new Error("Empty response from Gemini AI");
    }
  } catch (error) {
    console.error(`Failed to generate AI match for internship ${internship.id}:`, error);
    return null;
  }
}

export async function generateMultipleMatches(
  candidate: Candidate,
  internships: Internship[]
): Promise<InternshipMatchResult[]> {
  const results: InternshipMatchResult[] = [];
  
  // Process internships in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < internships.length; i += batchSize) {
    const batch = internships.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (internship) => {
      try {
        const result = await generateInternshipMatch(candidate, internship);
        return result;
      } catch (error) {
        console.error(`Error processing internship ${internship.id}:`, error);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(Boolean) as InternshipMatchResult[]);
    
    // Add small delay between batches to respect rate limits
    if (i + batchSize < internships.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

export async function generateMatchExplanation(
  candidate: Candidate,
  internship: Internship,
  matchPercentage: number,
  language: 'en' | 'hi' = 'en'
): Promise<string> {
  try {
    const systemPrompt = `You are a career counselor providing personalized advice. 
    Generate a brief, encouraging explanation (2-3 sentences) for why this internship is a good match.
    
    ${language === 'hi' ? 'Respond in Hindi language.' : 'Respond in English language.'}
    
    Focus on:
    - Specific skills that match
    - Learning opportunities
    - Career growth potential
    - Location/work arrangement benefits
    
    Keep it positive, specific, and under 200 characters.`;

    const prompt = `
    Candidate has skills: ${candidate.skills.join(', ')}
    Interested in sectors: ${candidate.sectors.join(', ')}
    Prefers locations: ${candidate.locations.join(', ')}
    
    Internship: ${internship.title} at ${internship.company}
    Location: ${internship.location}
    Required skills: ${internship.skills.join(', ')}
    Match percentage: ${matchPercentage}%
    
    Generate a brief explanation for this match.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt
      },
      contents: prompt
    });

    return response.text || "This internship offers valuable experience that aligns with your skills and career goals.";
  } catch (error) {
    console.error("Failed to generate match explanation:", error);
    
    // Fallback explanation based on language
    if (language === 'hi') {
      return "यह इंटर्नशिप आपके कौशल और करियर लक्ष्यों के साथ मेल खाता है और मूल्यवान अनुभव प्रदान करता है।";
    }
    return "This internship offers valuable experience that aligns with your skills and career goals.";
  }
}


// New function for ranking multiple internships at once (more efficient)
export async function rankInternships(
  candidate: Candidate,
  internships: Internship[]
): Promise<InternshipMatch[]> {
  try {
    const systemPrompt = `You are an expert career counselor and internship matching specialist.

Your task is to analyze a candidate's profile against multiple internship opportunities and rank them by match quality.

For each internship, provide:
1. A match percentage (0-100) based on skill overlap, location compatibility, education level, and sector alignment
2. A concise explanation (max 100 characters) of why this internship matches

Scoring Guidelines:
- Skills match (40%): How well candidate's skills align with required skills
- Location compatibility (25%): Geographic preference alignment or remote work options
- Education level (20%): Whether candidate meets education requirements  
- Sector interest (15%): How well the internship aligns with candidate's sector preferences

Return results sorted by match percentage in descending order.
Respond with JSON array in this exact format:
[{"internshipId": "string", "matchPercentage": number, "explanation": "string"}]`;

    const candidateProfile = `
Candidate Profile:
- Education: ${candidate.education}
- Skills: ${candidate.skills.join(', ')}
- Sector Interests: ${candidate.sectors.join(', ')}
- Location Preferences: ${candidate.locations.join(', ')}`;

    const internshipList = internships.map((internship, index) => `
${index + 1}. ID: ${internship.id}
   Title: ${internship.title}
   Company: ${internship.company}
   Location: ${internship.location}
   Required Skills: ${internship.skills.slice(0, 5).join(', ')}
   Sector: ${internship.sector || 'General'}`).join('');

    const prompt = `${candidateProfile}

Internship Opportunities:${internshipList}

Analyze and rank these internships for the candidate.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              internshipId: { type: "string" },
              matchPercentage: { 
                type: "number",
                minimum: 0,
                maximum: 100
              },
              explanation: { type: "string" }
            },
            required: ["internshipId", "matchPercentage", "explanation"]
          }
        }
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const result = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) {
      throw new Error('No response from Gemini API');
    }

    const rankings = JSON.parse(result) as Array<{
      internshipId: string;
      matchPercentage: number;
      explanation: string;
    }>;

    // Map back to InternshipMatch format
    const internshipMap = new Map(internships.map(i => [i.id, i]));
    const matches: InternshipMatch[] = [];

    for (const ranking of rankings) {
      const internship = internshipMap.get(ranking.internshipId);
      if (internship) {
        matches.push({
          internship,
          matchPercentage: ranking.matchPercentage,
          aiExplanation: ranking.explanation
        });
      }
    }

    console.log(`Gemini ranked ${matches.length} internships successfully`);
    return matches;

  } catch (error) {
    console.error('Error ranking internships with Gemini:', error);
    throw error;
  }
}
