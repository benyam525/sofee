import { ZipRawData } from "@/types/zip";

interface LifestyleSubscores {
  restaurantDensityScore: number;   // 0–100
  restaurantDiversityScore: number; // 0–100
  entertainmentScore: number;       // 0–100
  convenienceScore: number;         // 0–100
}

function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export function computeLifestyleSubscores(zip: ZipRawData, globalStats: { 
  maxRestaurantUnique: number;
  maxEntertainmentCount: number;
}): LifestyleSubscores {
  const restaurantDensityScore =
    globalStats.maxRestaurantUnique > 0
      ? (zip.restaurantUniqueCount / globalStats.maxRestaurantUnique) * 100
      : 0;

  const restaurantDiversityScore = clamp01(zip.restaurantDiversityIndex) * 100;

  const entertainmentScore =
    globalStats.maxEntertainmentCount > 0
      ? (zip.entertainmentCount / globalStats.maxEntertainmentCount) * 100
      : 0;

  const convenienceScore = zip.convenienceClusterScore; // already 0–100

  return {
    restaurantDensityScore,
    restaurantDiversityScore,
    entertainmentScore,
    convenienceScore
  };
}

export function computeLifestyleConvenienceCultureScore(
  subs: LifestyleSubscores
): number {
  // Weighted blend – you can tune these weights over time
  const wDensity = 0.3;
  const wDiversity = 0.25;
  const wEntertainment = 0.25;
  const wConvenience = 0.2;

  const score =
    wDensity * subs.restaurantDensityScore +
    wDiversity * subs.restaurantDiversityScore +
    wEntertainment * subs.entertainmentScore +
    wConvenience * subs.convenienceScore;

  return Math.max(0, Math.min(100, score));
}
