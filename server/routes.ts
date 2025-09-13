import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
        // Basic filtering by location
        const locationMatch = candidateData.locations.includes(internship.location) || 
                             internship.location === "Remote" ||
                             candidateData.locations.includes("Remote");
        
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
