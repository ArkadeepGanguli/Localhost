import { 
  type User, 
  type InsertUser, 
  type Candidate, 
  type InsertCandidate,
  type Internship,
  type InsertInternship,
  type MatchResult,
  type InsertMatchResult
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  getCandidate(id: string): Promise<Candidate | undefined>;
  
  createInternship(internship: InsertInternship): Promise<Internship>;
  getAllInternships(): Promise<Internship[]>;
  getInternshipsBySkills(skills: string[]): Promise<Internship[]>;
  getInternshipsByLocation(locations: string[]): Promise<Internship[]>;
  
  createMatchResult(matchResult: InsertMatchResult): Promise<MatchResult>;
  getMatchResultsByCandidateId(candidateId: string): Promise<MatchResult[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private candidates: Map<string, Candidate>;
  private internships: Map<string, Internship>;
  private matchResults: Map<string, MatchResult>;

  constructor() {
    this.users = new Map();
    this.candidates = new Map();
    this.internships = new Map();
    this.matchResults = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const id = randomUUID();
    const candidate: Candidate = { 
      ...insertCandidate, 
      id,
      language: insertCandidate.language ?? null
    };
    this.candidates.set(id, candidate);
    return candidate;
  }

  async getCandidate(id: string): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createInternship(insertInternship: InsertInternship): Promise<Internship> {
    const id = randomUUID();
    const internship: Internship = { 
      ...insertInternship, 
      id,
      salary: insertInternship.salary ?? null,
      description: insertInternship.description ?? null,
      sector: insertInternship.sector ?? null,
      applyLink: insertInternship.applyLink ?? null
    };
    this.internships.set(id, internship);
    return internship;
  }

  async getAllInternships(): Promise<Internship[]> {
    return Array.from(this.internships.values());
  }

  async getInternshipsBySkills(skills: string[]): Promise<Internship[]> {
    return Array.from(this.internships.values()).filter(internship =>
      internship.skills.some(skill => skills.includes(skill))
    );
  }

  async getInternshipsByLocation(locations: string[]): Promise<Internship[]> {
    return Array.from(this.internships.values()).filter(internship =>
      locations.includes(internship.location) || internship.location === "Remote"
    );
  }

  async createMatchResult(insertMatchResult: InsertMatchResult): Promise<MatchResult> {
    const id = randomUUID();
    const matchResult: MatchResult = { ...insertMatchResult, id };
    this.matchResults.set(id, matchResult);
    return matchResult;
  }

  async getMatchResultsByCandidateId(candidateId: string): Promise<MatchResult[]> {
    return Array.from(this.matchResults.values()).filter(
      result => result.candidateId === candidateId
    );
  }
}

export const storage = new MemStorage();
