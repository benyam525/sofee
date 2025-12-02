// DFW ZIP to School District mapping
// Maps ZIP codes to their primary school districts for aggregation

export const ZIP_TO_DISTRICT: Record<string, string> = {
  // Frisco ISD
  '75033': 'Frisco ISD',
  '75034': 'Frisco ISD',
  '75035': 'Frisco ISD',
  
  // Allen ISD
  '75013': 'Allen ISD',
  
  // McKinney ISD
  '75070': 'McKinney ISD',
  '75071': 'McKinney ISD',
  
  // Plano ISD
  '75023': 'Plano ISD',
  '75025': 'Plano ISD',
  
  // Prosper ISD
  '75078': 'Prosper ISD',
  
  // Celina ISD
  '75009': 'Celina ISD',
  
  // Carroll ISD (Southlake)
  '76092': 'Carroll ISD',
  
  // Grapevine-Colleyville ISD
  '76034': 'Grapevine-Colleyville ISD',
  
  // Carrollton-Farmers Branch ISD
  '75006': 'Carrollton-Farmers Branch ISD',
  
  // Coppell ISD
  '75019': 'Coppell ISD',
  
  // Grand Prairie ISD
  '75052': 'Grand Prairie ISD'
}

export function getDistrictForZip(zip: string): string | null {
  return ZIP_TO_DISTRICT[zip] || null
}

export function getZipsForDistrict(district: string): string[] {
  return Object.entries(ZIP_TO_DISTRICT)
    .filter(([_, d]) => d === district)
    .map(([zip]) => zip)
}
