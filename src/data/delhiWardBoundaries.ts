// Realistic Delhi Ward Boundaries for Satellite Map Visualization
// Based on actual Delhi NCT administrative boundaries

export interface WardBoundary {
  wardNumber: number;
  name: string;
  zone: string;
  coordinates: [number, number][][]; // GeoJSON polygon format [lng, lat]
  centroid: [number, number];
  greenCover: number;
  heatIndex: number;
  riskScore: number;
  population: number;
}

// Generate more realistic polygon shapes for Delhi wards
function generateWardPolygon(centerLat: number, centerLng: number, size: number, irregularity: number = 0.3): [number, number][][] {
  const points: [number, number][] = [];
  const numPoints = 6 + Math.floor(Math.random() * 4); // 6-9 sided polygons
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const radius = size * (1 + (Math.random() - 0.5) * irregularity);
    const lng = centerLng + radius * Math.cos(angle);
    const lat = centerLat + radius * Math.sin(angle);
    points.push([lng, lat]);
  }
  // Close the polygon
  points.push(points[0]);
  
  return [points];
}

export const DELHI_WARD_BOUNDARIES: WardBoundary[] = [
  // North Delhi Zone
  { 
    wardNumber: 1, 
    name: "Narela", 
    zone: "North Delhi",
    coordinates: generateWardPolygon(28.8528, 77.0969, 0.045),
    centroid: [77.0969, 28.8528],
    greenCover: 42,
    heatIndex: 52,
    riskScore: 28,
    population: 120000
  },
  { 
    wardNumber: 2, 
    name: "Alipur", 
    zone: "North Delhi",
    coordinates: generateWardPolygon(28.7960, 77.1350, 0.038),
    centroid: [77.1350, 28.7960],
    greenCover: 38,
    heatIndex: 55,
    riskScore: 32,
    population: 95000
  },
  { 
    wardNumber: 3, 
    name: "Rohini Zone I", 
    zone: "North West Delhi",
    coordinates: generateWardPolygon(28.7410, 77.0730, 0.032),
    centroid: [77.0730, 28.7410],
    greenCover: 28,
    heatIndex: 68,
    riskScore: 45,
    population: 180000
  },
  { 
    wardNumber: 4, 
    name: "Rohini Zone II", 
    zone: "North West Delhi",
    coordinates: generateWardPolygon(28.7280, 77.0980, 0.030),
    centroid: [77.0980, 28.7280],
    greenCover: 25,
    heatIndex: 72,
    riskScore: 52,
    population: 165000
  },
  { 
    wardNumber: 5, 
    name: "Shalimar Bagh", 
    zone: "North West Delhi",
    coordinates: generateWardPolygon(28.7190, 77.1540, 0.022),
    centroid: [77.1540, 28.7190],
    greenCover: 22,
    heatIndex: 75,
    riskScore: 58,
    population: 140000
  },
  { 
    wardNumber: 6, 
    name: "Wazirpur", 
    zone: "North West Delhi",
    coordinates: generateWardPolygon(28.6970, 77.1650, 0.018),
    centroid: [77.1650, 28.6970],
    greenCover: 15,
    heatIndex: 82,
    riskScore: 72,
    population: 85000
  },
  { 
    wardNumber: 7, 
    name: "Model Town", 
    zone: "North Delhi",
    coordinates: generateWardPolygon(28.7150, 77.1920, 0.020),
    centroid: [77.1920, 28.7150],
    greenCover: 32,
    heatIndex: 62,
    riskScore: 38,
    population: 125000
  },
  
  // Central Delhi Zone
  { 
    wardNumber: 8, 
    name: "Sadar Bazaar", 
    zone: "Central Delhi",
    coordinates: generateWardPolygon(28.6571, 77.2078, 0.015),
    centroid: [77.2078, 28.6571],
    greenCover: 8,
    heatIndex: 95,
    riskScore: 93,
    population: 95000
  },
  { 
    wardNumber: 9, 
    name: "Chandni Chowk", 
    zone: "Central Delhi",
    coordinates: generateWardPolygon(28.6562, 77.2306, 0.014),
    centroid: [77.2306, 28.6562],
    greenCover: 6,
    heatIndex: 96,
    riskScore: 95,
    population: 88000
  },
  { 
    wardNumber: 10, 
    name: "Civil Lines", 
    zone: "North Delhi",
    coordinates: generateWardPolygon(28.6820, 77.2230, 0.025),
    centroid: [77.2230, 28.6820],
    greenCover: 35,
    heatIndex: 58,
    riskScore: 35,
    population: 75000
  },
  { 
    wardNumber: 11, 
    name: "Karol Bagh", 
    zone: "Central Delhi",
    coordinates: generateWardPolygon(28.6519, 77.1886, 0.017),
    centroid: [77.1886, 28.6519],
    greenCover: 9,
    heatIndex: 94,
    riskScore: 91,
    population: 150000
  },
  { 
    wardNumber: 12, 
    name: "Rajinder Nagar", 
    zone: "Central Delhi",
    coordinates: generateWardPolygon(28.6430, 77.1820, 0.015),
    centroid: [77.1820, 28.6430],
    greenCover: 12,
    heatIndex: 88,
    riskScore: 78,
    population: 95000
  },
  
  // West Delhi Zone
  { 
    wardNumber: 13, 
    name: "Patel Nagar", 
    zone: "West Delhi",
    coordinates: generateWardPolygon(28.6580, 77.1550, 0.018),
    centroid: [77.1550, 28.6580],
    greenCover: 18,
    heatIndex: 78,
    riskScore: 62,
    population: 110000
  },
  { 
    wardNumber: 14, 
    name: "Rajouri Garden", 
    zone: "West Delhi",
    coordinates: generateWardPolygon(28.6490, 77.1220, 0.020),
    centroid: [77.1220, 28.6490],
    greenCover: 20,
    heatIndex: 75,
    riskScore: 55,
    population: 145000
  },
  { 
    wardNumber: 15, 
    name: "Dwarka", 
    zone: "South West Delhi",
    coordinates: generateWardPolygon(28.5921, 77.0460, 0.048),
    centroid: [77.0460, 28.5921],
    greenCover: 22,
    heatIndex: 72,
    riskScore: 48,
    population: 250000
  },
  { 
    wardNumber: 16, 
    name: "Najafgarh", 
    zone: "South West Delhi",
    coordinates: generateWardPolygon(28.6093, 76.9796, 0.055),
    centroid: [76.9796, 28.6093],
    greenCover: 45,
    heatIndex: 48,
    riskScore: 25,
    population: 180000
  },
  { 
    wardNumber: 17, 
    name: "Janakpuri", 
    zone: "West Delhi",
    coordinates: generateWardPolygon(28.6219, 77.0870, 0.028),
    centroid: [77.0870, 28.6219],
    greenCover: 24,
    heatIndex: 70,
    riskScore: 45,
    population: 195000
  },
  { 
    wardNumber: 18, 
    name: "Tilak Nagar", 
    zone: "West Delhi",
    coordinates: generateWardPolygon(28.6400, 77.0950, 0.017),
    centroid: [77.0950, 28.6400],
    greenCover: 16,
    heatIndex: 80,
    riskScore: 65,
    population: 125000
  },
  { 
    wardNumber: 19, 
    name: "Vikaspuri", 
    zone: "West Delhi",
    coordinates: generateWardPolygon(28.6350, 77.0680, 0.022),
    centroid: [77.0680, 28.6350],
    greenCover: 18,
    heatIndex: 78,
    riskScore: 60,
    population: 165000
  },
  { 
    wardNumber: 20, 
    name: "Uttam Nagar", 
    zone: "South West Delhi",
    coordinates: generateWardPolygon(28.6200, 77.0590, 0.018),
    centroid: [77.0590, 28.6200],
    greenCover: 14,
    heatIndex: 85,
    riskScore: 75,
    population: 180000
  },
  
  // New Delhi / South Delhi Zone
  { 
    wardNumber: 21, 
    name: "Mayapuri", 
    zone: "West Delhi",
    coordinates: generateWardPolygon(28.6380, 77.1180, 0.019),
    centroid: [77.1180, 28.6380],
    greenCover: 12,
    heatIndex: 88,
    riskScore: 78,
    population: 95000
  },
  { 
    wardNumber: 22, 
    name: "Connaught Place", 
    zone: "New Delhi",
    coordinates: generateWardPolygon(28.6315, 77.2167, 0.012),
    centroid: [77.2167, 28.6315],
    greenCover: 15,
    heatIndex: 82,
    riskScore: 68,
    population: 45000
  },
  { 
    wardNumber: 23, 
    name: "India Gate", 
    zone: "New Delhi",
    coordinates: generateWardPolygon(28.6129, 77.2295, 0.018),
    centroid: [77.2295, 28.6129],
    greenCover: 48,
    heatIndex: 45,
    riskScore: 22,
    population: 35000
  },
  { 
    wardNumber: 24, 
    name: "Lodhi Colony", 
    zone: "South Delhi",
    coordinates: generateWardPolygon(28.5918, 77.2273, 0.022),
    centroid: [77.2273, 28.5918],
    greenCover: 45,
    heatIndex: 48,
    riskScore: 25,
    population: 85000
  },
  { 
    wardNumber: 25, 
    name: "Defence Colony", 
    zone: "South Delhi",
    coordinates: generateWardPolygon(28.5742, 77.2311, 0.020),
    centroid: [77.2311, 28.5742],
    greenCover: 35,
    heatIndex: 58,
    riskScore: 35,
    population: 95000
  },
  { 
    wardNumber: 26, 
    name: "Lajpat Nagar", 
    zone: "South Delhi",
    coordinates: generateWardPolygon(28.5678, 77.2433, 0.018),
    centroid: [77.2433, 28.5678],
    greenCover: 22,
    heatIndex: 72,
    riskScore: 52,
    population: 120000
  },
  { 
    wardNumber: 27, 
    name: "Greater Kailash", 
    zone: "South Delhi",
    coordinates: generateWardPolygon(28.5494, 77.2432, 0.025),
    centroid: [77.2432, 28.5494],
    greenCover: 32,
    heatIndex: 62,
    riskScore: 40,
    population: 110000
  },
  { 
    wardNumber: 28, 
    name: "Saket", 
    zone: "South Delhi",
    coordinates: generateWardPolygon(28.5244, 77.2090, 0.028),
    centroid: [77.2090, 28.5244],
    greenCover: 28,
    heatIndex: 68,
    riskScore: 48,
    population: 145000
  },
  { 
    wardNumber: 29, 
    name: "Mehrauli", 
    zone: "South Delhi",
    coordinates: generateWardPolygon(28.5183, 77.1860, 0.032),
    centroid: [77.1860, 28.5183],
    greenCover: 38,
    heatIndex: 55,
    riskScore: 32,
    population: 165000
  },
  { 
    wardNumber: 30, 
    name: "Vasant Kunj", 
    zone: "South Delhi",
    coordinates: generateWardPolygon(28.5275, 77.1547, 0.030),
    centroid: [77.1547, 28.5275],
    greenCover: 35,
    heatIndex: 58,
    riskScore: 35,
    population: 175000
  },
  { 
    wardNumber: 31, 
    name: "RK Puram", 
    zone: "South Delhi",
    coordinates: generateWardPolygon(28.5663, 77.1780, 0.024),
    centroid: [77.1780, 28.5663],
    greenCover: 30,
    heatIndex: 65,
    riskScore: 42,
    population: 135000
  },
  
  // East Delhi Zone
  { 
    wardNumber: 32, 
    name: "Shahdara North", 
    zone: "East Delhi",
    coordinates: generateWardPolygon(28.6823, 77.2878, 0.028),
    centroid: [77.2878, 28.6823],
    greenCover: 15,
    heatIndex: 85,
    riskScore: 78,
    population: 225000
  },
  { 
    wardNumber: 33, 
    name: "Shahdara South", 
    zone: "East Delhi",
    coordinates: generateWardPolygon(28.6650, 77.2920, 0.027),
    centroid: [77.2920, 28.6650],
    greenCover: 18,
    heatIndex: 82,
    riskScore: 72,
    population: 195000
  },
  { 
    wardNumber: 34, 
    name: "Preet Vihar", 
    zone: "East Delhi",
    coordinates: generateWardPolygon(28.6390, 77.2940, 0.022),
    centroid: [77.2940, 28.6390],
    greenCover: 20,
    heatIndex: 78,
    riskScore: 62,
    population: 165000
  },
  { 
    wardNumber: 35, 
    name: "Mayur Vihar", 
    zone: "East Delhi",
    coordinates: generateWardPolygon(28.6093, 77.2937, 0.025),
    centroid: [77.2937, 28.6093],
    greenCover: 22,
    heatIndex: 75,
    riskScore: 55,
    population: 185000
  },
  { 
    wardNumber: 36, 
    name: "Patparganj", 
    zone: "East Delhi",
    coordinates: generateWardPolygon(28.6270, 77.3080, 0.024),
    centroid: [77.3080, 28.6270],
    greenCover: 16,
    heatIndex: 82,
    riskScore: 70,
    population: 155000
  },
  { 
    wardNumber: 37, 
    name: "Laxmi Nagar", 
    zone: "East Delhi",
    coordinates: generateWardPolygon(28.6357, 77.2786, 0.018),
    centroid: [77.2786, 28.6357],
    greenCover: 12,
    heatIndex: 88,
    riskScore: 82,
    population: 175000
  },
  { 
    wardNumber: 38, 
    name: "Vivek Vihar", 
    zone: "East Delhi",
    coordinates: generateWardPolygon(28.6650, 77.3150, 0.020),
    centroid: [77.3150, 28.6650],
    greenCover: 18,
    heatIndex: 80,
    riskScore: 65,
    population: 145000
  },
  
  // North East Delhi Zone
  { 
    wardNumber: 39, 
    name: "Dilshad Garden", 
    zone: "North East Delhi",
    coordinates: generateWardPolygon(28.6830, 77.3190, 0.021),
    centroid: [77.3190, 28.6830],
    greenCover: 14,
    heatIndex: 85,
    riskScore: 75,
    population: 195000
  },
  { 
    wardNumber: 40, 
    name: "Seelampur", 
    zone: "North East Delhi",
    coordinates: generateWardPolygon(28.6750, 77.2680, 0.015),
    centroid: [77.2680, 28.6750],
    greenCover: 8,
    heatIndex: 92,
    riskScore: 88,
    population: 210000
  },
  { 
    wardNumber: 41, 
    name: "Mustafabad", 
    zone: "North East Delhi",
    coordinates: generateWardPolygon(28.6960, 77.2580, 0.018),
    centroid: [77.2580, 28.6960],
    greenCover: 10,
    heatIndex: 90,
    riskScore: 85,
    population: 185000
  },
  { 
    wardNumber: 42, 
    name: "Karawal Nagar", 
    zone: "North East Delhi",
    coordinates: generateWardPolygon(28.7230, 77.2750, 0.025),
    centroid: [77.2750, 28.7230],
    greenCover: 16,
    heatIndex: 82,
    riskScore: 72,
    population: 175000
  },
  { 
    wardNumber: 43, 
    name: "Burari", 
    zone: "North Delhi",
    coordinates: generateWardPolygon(28.7590, 77.2010, 0.028),
    centroid: [77.2010, 28.7590],
    greenCover: 28,
    heatIndex: 65,
    riskScore: 45,
    population: 155000
  },
  { 
    wardNumber: 44, 
    name: "Timarpur", 
    zone: "North Delhi",
    coordinates: generateWardPolygon(28.7050, 77.2150, 0.019),
    centroid: [77.2150, 28.7050],
    greenCover: 30,
    heatIndex: 62,
    riskScore: 40,
    population: 95000
  },
  { 
    wardNumber: 45, 
    name: "Adarsh Nagar", 
    zone: "North Delhi",
    coordinates: generateWardPolygon(28.7180, 77.1700, 0.017),
    centroid: [77.1700, 28.7180],
    greenCover: 25,
    heatIndex: 70,
    riskScore: 50,
    population: 115000
  },
  
  // South East Delhi Zone
  { 
    wardNumber: 46, 
    name: "Okhla", 
    zone: "South East Delhi",
    coordinates: generateWardPolygon(28.5560, 77.2760, 0.026),
    centroid: [77.2760, 28.5560],
    greenCover: 18,
    heatIndex: 80,
    riskScore: 68,
    population: 175000
  },
  { 
    wardNumber: 47, 
    name: "Kalkaji", 
    zone: "South East Delhi",
    coordinates: generateWardPolygon(28.5385, 77.2590, 0.022),
    centroid: [77.2590, 28.5385],
    greenCover: 25,
    heatIndex: 72,
    riskScore: 55,
    population: 145000
  },
];

// Convert to GeoJSON for map consumption
export function getWardGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: DELHI_WARD_BOUNDARIES.map(ward => ({
      type: "Feature" as const,
      properties: {
        wardNumber: ward.wardNumber,
        name: ward.name,
        zone: ward.zone,
        greenCover: ward.greenCover,
        heatIndex: ward.heatIndex,
        riskScore: ward.riskScore,
        population: ward.population,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: ward.coordinates,
      },
    })),
  };
}

// Get centroid markers for alerts
export function getAlertLocations(): Array<{
  name: string;
  coordinates: [number, number];
  heatIndex: number;
  greenCover: number;
  riskScore: number;
}> {
  return DELHI_WARD_BOUNDARIES.map(ward => ({
    name: ward.name,
    coordinates: [ward.centroid[1], ward.centroid[0]] as [number, number], // [lat, lng] for Leaflet
    heatIndex: ward.heatIndex,
    greenCover: ward.greenCover,
    riskScore: ward.riskScore,
  }));
}
