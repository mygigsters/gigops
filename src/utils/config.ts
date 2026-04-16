import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';

dotenv.config();

export interface UserProfile {
  name: string;
  title: string;
  skills: {
    primary: string[];
    secondary: string[];
  };
  experience_years: number;
  hourly_rate: {
    minimum: number;
    target: number;
    currency: string;
  };
  availability: {
    hours_per_week: number;
    timezone: string;
  };
  location: string;
  platforms: string[];
  portfolio_url?: string;
  bio: string;
  preferences: {
    remote_only: boolean;
    min_project_value: number;
    max_project_duration: string;
    avoid: string[];
  };
  proof_points: string[];
  career_story: string;
}

export interface PlatformConfig {
  name: string;
  base_url: string;
  search_url: string;
  selectors: {
    listing_card: string;
    title: string;
    description: string;
    budget: string;
    client_name?: string;
    client_rating?: string;
    posted_date?: string;
    skills_required?: string;
    proposals_count?: string;
  };
  auth_required: boolean;
  rate_limit_ms: number;
}

let _profile: UserProfile | null = null;

export function loadProfile(profilePath?: string): UserProfile {
  if (_profile) return _profile;

  const searchPaths = [
    profilePath,
    './config/profile.yml',
    path.join(process.env.HOME || '~', '.gigops', 'profile.yml'),
  ].filter(Boolean) as string[];

  for (const p of searchPaths) {
    const resolved = path.resolve(p);
    if (fs.existsSync(resolved)) {
      const content = fs.readFileSync(resolved, 'utf-8');
      _profile = yaml.load(content) as UserProfile;
      return _profile;
    }
  }

  throw new Error(
    'Profile not found. Run `gigops doctor` to set up, or copy config/profile.example.yml to config/profile.yml'
  );
}

export function loadPlatformConfig(platform: string): PlatformConfig {
  const configPath = path.resolve(`./config/platforms/${platform}.yml`);
  if (!fs.existsSync(configPath)) {
    throw new Error(`Platform config not found: ${configPath}`);
  }
  const content = fs.readFileSync(configPath, 'utf-8');
  return yaml.load(content) as PlatformConfig;
}

export function getEnv(key: string, required = true): string {
  const val = process.env[key];
  if (!val && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val || '';
}

export function detectPlatform(url: string): string {
  if (url.includes('upwork.com')) return 'upwork';
  if (url.includes('airtasker.com')) return 'airtasker';
  if (url.includes('freelancer.com')) return 'freelancer';
  if (url.includes('fiverr.com')) return 'fiverr';
  if (url.includes('guru.com')) return 'guru';
  return 'generic';
}
