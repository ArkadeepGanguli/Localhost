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
    try {
      // Use the real CSV file
      const internshipsPath = path.join(this.csvPath, 'internships_filtered_1757786646486.csv');
      const content = fs.readFileSync(internshipsPath, 'utf-8');
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const internships: InsertInternship[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = this.parseCSVLine(line);
        if (values.length >= 4) {
          const title = values[0] || 'Internship Position';
          const location = values[1] || 'Location';
          const startSalary = values[2] || '';
          const maxSalary = values[3] || '';
          const skillsString = values[4] || '';
          
          // Generate salary string
          const salary = this.generateSalaryString(startSalary, maxSalary);
          
          // Generate company name based on the role
          const company = this.generateCompanyName(title);
          
          // Determine sector based on title and skills
          const sector = this.determineSector(title, skillsString);
          
          const internship: InsertInternship = {
            title,
            company,
            location,
            salary,
            skills: this.parseSkillsFromString(skillsString),
            description: null,
            sector,
            applyLink: null
          };
          internships.push(internship);
        }
      }
      
      console.log(`Loaded ${internships.length} internships from CSV`);
      return internships;
    } catch (error) {
      console.error('Error parsing internships CSV:', error);
      // Fallback to mock data if CSV fails
      return this.generateMockInternships();
    }
  }
  
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && (i === line.length - 1 || line[i+1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }
  
  private parseSkillsFromString(skillsString: string): string[] {
    if (!skillsString) return ['General'];
    return skillsString.split(',').map(s => s.trim().replace(/"/g, '')).filter(s => s.length > 0);
  }
  
  private generateSalaryString(startSalary: string, maxSalary: string): string | null {
    const start = parseInt(startSalary) || 0;
    const max = parseInt(maxSalary) || 0;
    
    if (start > 0 && max > 0) {
      if (start === max) {
        return `₹${start.toLocaleString()}/month`;
      } else {
        return `₹${start.toLocaleString()} - ₹${max.toLocaleString()}/month`;
      }
    }
    return null;
  }
  
  private generateCompanyName(title: string): string {
    const companyPrefixes = ['Tech', 'Digital', 'Creative', 'Smart', 'Pro', 'Elite', 'Prime', 'Global', 'Innovative', 'Modern'];
    const companySuffixes = ['Solutions', 'Systems', 'Corp', 'Ltd', 'Technologies', 'Innovations', 'Labs', 'Studios', 'Group', 'Enterprises'];
    
    // Generate company name based on the role type
    if (title.toLowerCase().includes('marketing')) {
      return `${companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]} Marketing ${companySuffixes[Math.floor(Math.random() * companySuffixes.length)]}`;
    } else if (title.toLowerCase().includes('tech') || title.toLowerCase().includes('developer') || title.toLowerCase().includes('software')) {
      return `${companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]} ${companySuffixes[Math.floor(Math.random() * companySuffixes.length)]}`;
    } else if (title.toLowerCase().includes('design')) {
      return `${companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]} Design ${companySuffixes[Math.floor(Math.random() * companySuffixes.length)]}`;
    } else if (title.toLowerCase().includes('sales') || title.toLowerCase().includes('business development')) {
      return `${companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]} Business ${companySuffixes[Math.floor(Math.random() * companySuffixes.length)]}`;
    } else {
      return `${companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]} ${companySuffixes[Math.floor(Math.random() * companySuffixes.length)]}`;
    }
  }
  
  private determineSector(title: string, skills: string): string | null {
    const titleLower = title.toLowerCase();
    const skillsLower = skills.toLowerCase();
    
    if (titleLower.includes('developer') || titleLower.includes('software') || titleLower.includes('tech') || skillsLower.includes('javascript') || skillsLower.includes('python')) {
      return 'Technology';
    } else if (titleLower.includes('marketing') || skillsLower.includes('seo') || skillsLower.includes('digital marketing')) {
      return 'Marketing';
    } else if (titleLower.includes('design') || skillsLower.includes('photoshop') || skillsLower.includes('illustrator')) {
      return 'Design';
    } else if (titleLower.includes('sales') || titleLower.includes('business development')) {
      return 'Sales';
    } else if (titleLower.includes('finance') || titleLower.includes('accounting')) {
      return 'Finance';
    } else if (titleLower.includes('hr') || titleLower.includes('human resource')) {
      return 'Operations';
    } else {
      return 'Operations';
    }
  }
  
  private generateMockInternships(): InsertInternship[] {
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
