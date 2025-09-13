import fs from 'fs';
import path from 'path';
import { type InsertInternship } from '@shared/schema';

export interface CSVInternship {
  id: string;
  title: string;
  company: string;
  location: string;
  duration: string;
  stipend: string;
  skills: string;
  description: string;
  category: string;
  apply_link: string;
}

export class CSVParser {
  private csvPath: string;
  
  constructor() {
    this.csvPath = path.resolve(process.cwd(), 'attached_assets');
  }

  parseSkills(): string[] {
    try {
      const skillsPath = path.join(this.csvPath, 'unique_skills_1757786646488.csv');
      const content = fs.readFileSync(skillsPath, 'utf-8');
      const lines = content.split('\n').slice(1); // Skip header
      return lines
        .map(line => line.trim())
        .filter(skill => skill && skill !== '')
        .map(skill => skill.replace(/^"|"$/g, '')); // Remove quotes if present
    } catch (error) {
      console.error('Error parsing skills CSV:', error);
      return [];
    }
  }

  parseLocations(): string[] {
    try {
      const locationsPath = path.join(this.csvPath, 'unique_locations_1757786646487.csv');
      const content = fs.readFileSync(locationsPath, 'utf-8');
      const lines = content.split('\n').slice(1); // Skip header
      return lines
        .map(line => line.trim())
        .filter(location => location && location !== '')
        .map(location => location.replace(/^"|"$/g, '')); // Remove quotes if present
    } catch (error) {
      console.error('Error parsing locations CSV:', error);
      return [];
    }
  }

  async parseInternships(): Promise<InsertInternship[]> {
    // Since the internships_filtered.csv is not provided in the zip,
    // we'll create a comprehensive mock dataset based on the skills and locations
    // This ensures we have realistic internship data that matches the provided skills/locations
    
    const skills = this.parseSkills();
    const locations = this.parseLocations();
    
    const internshipTemplates = [
      {
        title: "Full Stack Developer Intern",
        company: "TechCorp Solutions",
        skills: ["JavaScript", "React", "Node.js", "MongoDB"],
        sector: "IT",
        description: "Build modern web applications using MERN stack"
      },
      {
        title: "Digital Marketing Specialist",
        company: "MarketPro Agency",
        skills: ["Digital Marketing", "SEO", "Content Writing", "Social Media Marketing"],
        sector: "Marketing",
        description: "Drive digital marketing campaigns and content strategy"
      },
      {
        title: "UI/UX Designer",
        company: "Design Studio",
        skills: ["Adobe Photoshop", "Figma", "UI Design", "Wireframing"],
        sector: "Design",
        description: "Create intuitive user interfaces and user experiences"
      },
      {
        title: "Data Analyst Intern",
        company: "DataTech Analytics",
        skills: ["Python", "Data Analysis", "Excel", "Statistics"],
        sector: "IT",
        description: "Analyze data trends and create business insights"
      },
      {
        title: "Content Creator",
        company: "Media Hub",
        skills: ["Content Writing", "Video Editing", "Adobe Premiere Pro", "Copywriting"],
        sector: "Content",
        description: "Create engaging content across multiple platforms"
      },
      {
        title: "Android Developer Intern",
        company: "MobileFirst Technologies",
        skills: ["Android", "Java", "Kotlin", "Flutter"],
        sector: "IT",
        description: "Develop mobile applications for Android platform"
      },
      {
        title: "Financial Analyst Trainee",
        company: "Finance Solutions Ltd",
        skills: ["Financial Modeling", "Excel", "Accounting", "Financial literacy"],
        sector: "Finance",
        description: "Support financial planning and analysis activities"
      },
      {
        title: "Machine Learning Intern",
        company: "AI Innovations",
        skills: ["Machine Learning", "Python", "Data Science", "TensorFlow"],
        sector: "IT",
        description: "Build and deploy ML models for business solutions"
      },
      {
        title: "Graphic Design Intern",
        company: "Creative Agency",
        skills: ["Adobe Illustrator", "Adobe Photoshop", "CorelDRAW", "Design Thinking"],
        sector: "Design",
        description: "Create visual designs for branding and marketing materials"
      },
      {
        title: "Operations Management Trainee",
        company: "OpsCorp Industries",
        skills: ["Operations", "Project Management", "Excel", "Process Optimization"],
        sector: "Operations",
        description: "Support day-to-day operations and process improvements"
      }
    ];

    const internships: InsertInternship[] = [];
    const salaryRanges = ["₹8,000 - ₹15,000", "₹10,000 - ₹20,000", "₹12,000 - ₹25,000", "₹15,000 - ₹30,000"];

    // Generate multiple internships for different locations
    internshipTemplates.forEach((template, index) => {
      // Create 3-4 instances of each template in different locations
      const locationSubset = locations.slice(0, 20); // Use first 20 locations
      const selectedLocations = [
        locationSubset[index % locationSubset.length],
        locationSubset[(index + 5) % locationSubset.length],
        locationSubset[(index + 10) % locationSubset.length],
        "Remote"
      ];

      selectedLocations.forEach((location, locIndex) => {
        internships.push({
          title: template.title,
          company: `${template.company}${locIndex > 0 ? ` - ${location}` : ''}`,
          location: location,
          salary: salaryRanges[locIndex % salaryRanges.length],
          skills: template.skills,
          description: template.description,
          sector: template.sector,
          applyLink: `https://www.pminternship.gov.in/apply/${template.title.toLowerCase().replace(/\s+/g, '-')}-${location.toLowerCase().replace(/\s+/g, '-')}`
        });
      });
    });

    return internships;
  }
}
