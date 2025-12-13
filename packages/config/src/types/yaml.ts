/**
 * @fileoverview YAML config type definitions
 * @module @leaderboard/config/types/yaml
 *
 * Type definitions for the YAML configuration file structure.
 * These types mirror the JSON schema in config.schema.json.
 */

// =============================================================================
// Organization Configuration
// =============================================================================

/**
 * Organization information configuration.
 */
export interface OrgConfig {
  /** Organization name */
  name: string;
  /** Organization description */
  description: string;
  /** Organization website URL */
  url: string;
  /** Organization logo URL */
  logo_url: string;
  /** Organization start date (YYYY-MM-DD) */
  start_date?: string;
  /** Social media links */
  socials?: {
    github?: string;
    slack?: string;
    linkedin?: string;
    youtube?: string;
    email?: string;
  };
}

// =============================================================================
// Site Metadata Configuration
// =============================================================================

/**
 * Site and SEO metadata configuration.
 */
export interface MetaConfig {
  /** Site title */
  title: string;
  /** Site description for SEO */
  description: string;
  /** Open Graph image URL */
  image_url: string;
  /** Site URL */
  site_url: string;
  /** Favicon URL */
  favicon_url: string;
}

// =============================================================================
// Role Configuration
// =============================================================================

/**
 * Role configuration for a single role.
 */
export interface RoleConfig {
  /** Display name for the role */
  name: string;
  /** Role description */
  description?: string;
  /** Whether this role should be hidden from leaderboard */
  hidden?: boolean;
}

/**
 * Social profile icon configuration.
 */
export interface SocialProfileConfig {
  /** Lucide icon name */
  icon: string;
}

// =============================================================================
// Leaderboard Configuration
// =============================================================================

/**
 * Leaderboard-related configuration.
 */
export interface LeaderboardYamlConfig {
  /** URL to the leaderboard data repository */
  data_source: string;
  /** Role definitions */
  roles: Record<string, RoleConfig>;
  /** Activity slugs to show in top contributors sidebar */
  top_contributors?: string[];
  /** Social profile icon mappings */
  social_profiles?: Record<string, SocialProfileConfig>;
  /** Custom theme CSS URL */
  theme?: string;
}

// =============================================================================
// Scraper Configuration
// =============================================================================

/**
 * Individual scraper instance configuration.
 */
export interface ScraperInstanceConfig {
  /** Display name for the scraper */
  name: string;
  /** GitHub repository in format 'owner/repo' */
  repository: string;
  /** Environment variables for the scraper */
  envs: Record<string, string>;
}

/**
 * Scraper configuration for GitHub Actions workflow generation.
 */
export interface ScraperYamlConfig {
  /** Cron expression for scheduled execution */
  schedule: string;
  /** List of scrapers to run */
  scrapers: ScraperInstanceConfig[];
}

// =============================================================================
// Complete YAML Configuration
// =============================================================================

/**
 * Complete YAML configuration file structure.
 */
export interface YamlConfig {
  /** Organization information */
  org: OrgConfig;
  /** Site and SEO metadata */
  meta: MetaConfig;
  /** Leaderboard configuration */
  leaderboard: LeaderboardYamlConfig;
  /** Scraper configuration (optional) */
  scraper?: ScraperYamlConfig;
}
