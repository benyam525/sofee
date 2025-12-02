export type CriterionKey =
  | "schoolQuality"
  | "commuteBurden"
  | "safetyStability"
  | "lifestyleConvenienceCulture"
  | "childDevelopmentOpportunity"
  | "taxBurden"
  | "tollRoadConvenience"

export interface CriterionConfig {
  key: CriterionKey
  label: string
  description: string
  minWeight: number // 0
  maxWeight: number // 3 - updated from 5 to 3 per spec
  defaultWeight: number
}

export const CRITERIA: CriterionConfig[] = [
  {
    key: "schoolQuality",
    label: "School Quality",
    description: "How much you prioritize strong public schools.",
    minWeight: 0,
    maxWeight: 3,
    defaultWeight: 2,
  },
  {
    key: "commuteBurden",
    label: "Commute Burden",
    description: "How important it is to minimize commute time to work.",
    minWeight: 0,
    maxWeight: 3,
    defaultWeight: 1,
  },
  {
    key: "safetyStability",
    label: "Safety & Stability",
    description: "How much you value low crime and neighborhood stability.",
    minWeight: 0,
    maxWeight: 3,
    defaultWeight: 2,
  },
  {
    key: "lifestyleConvenienceCulture",
    label: "Lifestyle, Convenience & Culture",
    description: "Access to unique restaurants, entertainment for kids and adults, and everyday convenience.",
    minWeight: 0,
    maxWeight: 3,
    defaultWeight: 1,
  },
  {
    key: "childDevelopmentOpportunity",
    label: "Family-Friendly Amenities",
    description: "Parks, libraries, youth sports, enrichment, and spaces that support your kids' growth.",
    minWeight: 0,
    maxWeight: 3,
    defaultWeight: 1,
  },
  {
    key: "taxBurden",
    label: "Tax Burden",
    description: "How sensitive you are to property tax + MUD rates.",
    minWeight: 0,
    maxWeight: 3,
    defaultWeight: 1,
  },
  {
    key: "tollRoadConvenience",
    label: "Toll Road Convenience",
    description: "How important it is to have quick access to major toll roads and highways.",
    minWeight: 0,
    maxWeight: 3,
    defaultWeight: 1,
  },
]

export interface UserWeights {
  schoolQuality: number
  commuteBurden: number
  safetyStability: number
  lifestyleConvenienceCulture: number
  childDevelopmentOpportunity: number
  taxBurden: number
  tollRoadConvenience: number
}

export interface UserMeta {
  workplaceZip?: string | null
}

export type LifestyleTag =
  | "quietPredictable"
  | "sportsHeavy"
  | "diverseGlobal"
  | "upscaleRefined"
  | "kidFirst"
  | "townCenter"
  | "lateNightFood"

export interface UserLifestylePrefs {
  tags: LifestyleTag[]
}

export interface UserSpecialPrefs {
  preferTownCenter: boolean
  preferNewerHomes: boolean
  preferEstablishedNeighborhoods: boolean
}

export interface UserAllPrefs {
  weights: UserWeights
  lifestyle: UserLifestylePrefs
  special: UserSpecialPrefs
}
