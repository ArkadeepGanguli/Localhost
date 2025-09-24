import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import { CSVParser } from "./services/csvParser";
import { matchingService } from "./services/matchingService";
import { insertCandidateSchema, type CandidateFormData } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const csvParser = new CSVParser();
  
  // Initialize internships data on startup
  const internshipsData = await csvParser.parseInternships();
  for (const internship of internshipsData) {
    await storage.createInternship(internship);
  }
  
  // Get available skills from CSV
  app.get("/api/skills", async (_req, res) => {
    try {
      const skills = csvParser.parseSkills();
      res.json({ skills });
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  // Get available locations from CSV
  app.get("/api/locations", async (_req, res) => {
    try {
      const locations = csvParser.parseLocations();
      res.json({ locations });
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Submit candidate form and get matches
  app.post("/api/matches", async (req, res) => {
    try {
      const candidateData = insertCandidateSchema.parse(req.body);
      
      // Create candidate record
      const candidate = await storage.createCandidate(candidateData);
      
      // Get all internships
      const allInternships = await storage.getAllInternships();
      
      // Filter internships based on candidate preferences
      const relevantInternships = allInternships.filter(internship => {
        // Location filtering rules:
        // - 'Any Location' => do not filter by location
        // - 'Remote' only   => only Remote internships
        // - Specific cities => only the selected cities
        let locationMatch = true;
        const wantsAny = candidateData.locations.includes('Any Location');
        if (!wantsAny) {
          if (candidateData.locations.length === 1 && candidateData.locations[0] === 'Remote') {
            locationMatch = internship.location === 'Remote';
          } else if (candidateData.locations.length > 0) {
            locationMatch = candidateData.locations.includes(internship.location);
          }
        }

        // Basic filtering by skills (at least one skill match)
        const skillMatch = candidateData.skills.some(skill => 
          internship.skills.some(intSkill => 
            intSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(intSkill.toLowerCase())
          )
        );
        
        return locationMatch && skillMatch;
      });
      
      // Get AI-powered matches
      const matches = await matchingService.findMatches(candidate, relevantInternships);
      
      // Store match results
      for (const match of matches) {
        await storage.createMatchResult({
          candidateId: candidate.id,
          internshipId: match.internship.id,
          matchPercentage: match.matchPercentage,
          aiExplanation: match.aiExplanation
        });
      }
      
      res.json({ 
        matches,
        candidateId: candidate.id 
      });
    } catch (error) {
      console.error('Error generating matches:', error);
      res.status(500).json({ message: "Failed to generate matches" });
    }
  });

  // Healthcheck: validate Gemini API key by performing a tiny request
  app.get("/api/health/gemini", async (_req, res) => {
    try {
      const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      if (!key) {
        return res.status(500).json({ ok: false, message: "No Gemini API key in environment (GEMINI_API_KEY or GOOGLE_AI_API_KEY)." });
      }

      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: "Reply with the word ok.",
          responseMimeType: "text/plain",
        },
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
      });

      const text: string | undefined = (response as any).text ?? response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === "string" && text.toLowerCase().includes("ok")) {
        return res.json({ ok: true, message: "Gemini API reachable and responded.", model: "gemini-2.5-flash" });
      }
      return res.status(502).json({ ok: false, message: "Gemini API responded but unexpected payload.", raw: text ?? null });
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || String(error), code: error?.code, status: error?.status });
    }
  });

  // Get match history for a candidate
  app.get("/api/matches/:candidateId", async (req, res) => {
    try {
      const { candidateId } = req.params;
      const matchResults = await storage.getMatchResultsByCandidateId(candidateId);
      
      const matches = await Promise.all(
        matchResults.map(async (result) => {
          const internship = await storage.getAllInternships().then(
            internships => internships.find(i => i.id === result.internshipId)
          );
          
          if (!internship) return null;
          
          return {
            internship,
            matchPercentage: result.matchPercentage,
            aiExplanation: result.aiExplanation
          };
        })
      );
      
      res.json({ matches: matches.filter(Boolean) });
    } catch (error) {
      console.error('Error fetching match history:', error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
