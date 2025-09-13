import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  education: text("education").notNull(),
  skills: text("skills").array().notNull(),
  sectors: text("sectors").array().notNull(),
  locations: text("locations").array().notNull(),
  language: text("language").default("en"),
});

export const internships = pgTable("internships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  salary: text("salary"),
  skills: text("skills").array().notNull(),
  description: text("description"),
  sector: text("sector"),
  applyLink: text("apply_link"),
});

export const matchResults = pgTable("match_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull(),
  internshipId: varchar("internship_id").notNull(),
  matchPercentage: real("match_percentage").notNull(),
  aiExplanation: text("ai_explanation").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).pick({
  fullName: true,
  email: true,
  education: true,
  skills: true,
  sectors: true,
  locations: true,
  language: true,
});

export const insertInternshipSchema = createInsertSchema(internships).omit({
  id: true,
});

export const insertMatchResultSchema = createInsertSchema(matchResults).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type Internship = typeof internships.$inferSelect;
export type InsertMatchResult = z.infer<typeof insertMatchResultSchema>;
export type MatchResult = typeof matchResults.$inferSelect;

// API response types
export type InternshipMatch = {
  internship: Internship;
  matchPercentage: number;
  aiExplanation: string;
};

export type CandidateFormData = {
  fullName: string;
  email: string;
  education: string;
  skills: string[];
  sectors: string[];
  locations: string[];
  language: string;
};
