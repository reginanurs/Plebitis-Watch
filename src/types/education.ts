export interface EducationSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface EducationRelatedLink {
  label: string
  path: string
}

export interface EducationItem {
  id: string
  title: string
  category: string
  summary: string
  sections: EducationSection[]
  relatedLinks?: EducationRelatedLink[]
  lastUpdated?: string
}
