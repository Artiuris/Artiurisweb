export interface Artwork {
  id: string;
  title: string;
  year?: string;
  technique?: string;
  dimensions?: string;
  image: string;
  images?: string[];
  description?: string;
  comments?: string;
  info?: string;
  exhibitions?: string;
}

export interface Artist {
  id: string;
  name: string;
  birthYear?: string;
  birthPlace?: string;
  biography: string;
  extraInfo?: string;
  photo?: string | null;
  works: Artwork[];
}

export interface AboutSection {
  title: string;
  body: string;
  image?: string;
  workId?: string; // ID of an artwork to display alongside this section
}

export interface DisciplineContent {
  title: string;
  description: string;
  works: string[]; // work IDs
}

export interface SiteConfig {
  collectionName: string;
  collectionSubtitle: string;
  description: string;
  heroTagline: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress?: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
  aboutText: string;
  aboutSections?: AboutSection[];
  aboutQuote?: string;
  stats: {
    artists: string;
    works: string;
    techniques: string;
    autoUpdate?: boolean;
  };
  aboutWorkIds?: string[];
  featuredWorkIds?: string[];
  disciplines?: Record<string, DisciplineContent>;
  ctaTitle?: string;
  ctaSubtitle?: string;
  footerDescription?: string;
}
