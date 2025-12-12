// New Zealand location hierarchy
// Proper structure: Region → City/Town → Suburb (only for major cities)

export interface CityData {
  suburbs: string[];
}

export interface RegionData {
  cities: Record<string, CityData>;
  // Towns are cities without suburbs
  towns: string[];
}

export const NZ_LOCATION_HIERARCHY: Record<string, RegionData> = {
  Auckland: {
    cities: {
      Auckland: {
        suburbs: [
          // Central
          "Ponsonby", "Grey Lynn", "Westmere", "Herne Bay", "Freemans Bay", "Parnell",
          "Newmarket", "Remuera", "Epsom", "Mt Eden", "Kingsland", "Morningside",
          "Sandringham", "Mt Albert", "Waterview", "Point Chevalier", "St Lukes",
          // North Shore
          "Takapuna", "Milford", "Devonport", "Northcote", "Birkenhead", "Bayswater",
          "Belmont", "Hauraki", "Forrest Hill", "Sunnynook", "Glenfield", "Beach Haven",
          "Birkdale", "Albany", "Browns Bay", "Mairangi Bay", "Murrays Bay", "Long Bay",
          "Torbay", "Rothesay Bay",
          // West Auckland
          "Kumeu", "Huapai", "Waimauku", "Henderson", "Te Atatu", "Te Atatu Peninsula",
          "Glen Eden", "New Lynn", "Titirangi", "Green Bay", "Blockhouse Bay",
          "Avondale", "Kelston", "Massey", "Westgate", "Hobsonville", "West Harbour",
          // South Auckland
          "Manukau", "Manurewa", "Papatoetoe", "Otahuhu", "Otara", "Flat Bush",
          "Botany Downs", "East Tamaki", "Pakuranga", "Howick", "Bucklands Beach",
          "Half Moon Bay", "Cockle Bay", "Highland Park", "Dannemora",
          // East Auckland
          "Mission Bay", "St Heliers", "Kohimarama", "Orakei", "Glendowie",
          "Glen Innes", "Panmure", "Mt Wellington", "Ellerslie", "Penrose",
        ],
      },
    },
    towns: ["Pukekohe", "Warkworth", "Helensville", "Wellsford"],
  },
  Wellington: {
    cities: {
      Wellington: {
        suburbs: [
          "Wellington Central", "Te Aro", "Thorndon", "Lambton", "Pipitea",
          "Aro Valley", "Kelburn", "Brooklyn", "Mt Victoria", "Oriental Bay",
          "Roseneath", "Hataitai", "Kilbirnie", "Lyall Bay", "Miramar", "Karori",
          "Northland", "Wadestown", "Khandallah", "Ngaio", "Crofton Downs",
          "Johnsonville", "Newlands", "Churton Park", "Tawa",
        ],
      },
      "Lower Hutt": {
        suburbs: [
          "Petone", "Eastbourne", "Wainuiomata", "Naenae", "Taita", "Avalon",
          "Waterloo", "Epuni", "Woburn",
        ],
      },
      "Upper Hutt": {
        suburbs: ["Silverstream", "Heretaunga", "Totara Park", "Trentham", "Brown Owl"],
      },
      Porirua: {
        suburbs: ["Titahi Bay", "Papakowhai", "Aotea", "Whitby", "Paremata", "Plimmerton"],
      },
    },
    towns: ["Kapiti Coast", "Paraparaumu", "Waikanae", "Otaki", "Martinborough", "Featherston"],
  },
  Canterbury: {
    cities: {
      Christchurch: {
        suburbs: [
          "Christchurch Central", "Merivale", "Fendalton", "Ilam", "Riccarton",
          "Addington", "Sydenham", "Woolston", "Linwood", "St Albans", "Papanui",
          "Bishopdale", "Burnside", "Bryndwr", "Avonhead", "Halswell", "Hornby",
          "Sockburn", "Wigram", "Templeton", "Prebbleton", "Lincoln", "Rolleston",
          "Sumner", "Lyttelton", "New Brighton", "Shirley", "Mairehau", "Northwood",
          "Belfast", "Redwood", "Casebrook",
        ],
      },
    },
    towns: ["Timaru", "Ashburton", "Rangiora", "Kaiapoi", "Geraldine", "Akaroa", "Hanmer Springs"],
  },
  Waikato: {
    cities: {
      Hamilton: {
        suburbs: [
          "Hamilton Central", "Hamilton East", "Hamilton West", "Hamilton Lake",
          "Frankton", "Dinsdale", "Nawton", "Beerescourt", "Whitiora", "Claudelands",
          "Fairfield", "Hillcrest", "Rototuna", "Flagstaff", "St Andrews", "Chartwell",
          "Chedworth", "Silverdale", "Melville", "Fitzroy", "Glenview", "Enderley",
          "Huntington", "Rotokauri", "Te Rapa",
        ],
      },
    },
    towns: ["Cambridge", "Te Awamutu", "Huntly", "Ngaruawahia", "Raglan", "Matamata", "Morrinsville", "Thames", "Coromandel"],
  },
  Otago: {
    cities: {
      Dunedin: {
        suburbs: [
          "Dunedin Central", "North Dunedin", "South Dunedin", "St Kilda", "St Clair",
          "Maori Hill", "Roslyn", "Mornington", "Kenmure", "Kaikorai", "Wakari",
          "Halfway Bush", "Helensburgh", "Musselburgh", "Andersons Bay", "Macandrew Bay",
          "Port Chalmers", "Mosgiel", "Green Island",
        ],
      },
      Queenstown: {
        suburbs: [
          "Queenstown Central", "Frankton", "Kelvin Heights", "Arthurs Point",
          "Arrowtown", "Jack's Point", "Lake Hayes",
        ],
      },
    },
    towns: ["Wanaka", "Oamaru", "Alexandra", "Cromwell", "Clyde", "Balclutha"],
  },
  "Bay of Plenty": {
    cities: {
      Tauranga: {
        suburbs: [
          "Tauranga Central", "Mt Maunganui", "Papamoa", "Greerton", "Gate Pa",
          "Otumoetai", "Cherrywood", "Bethlehem", "Welcome Bay", "Pyes Pa",
          "The Lakes", "Tauriko",
        ],
      },
      Rotorua: {
        suburbs: [
          "Rotorua Central", "Ohinemutu", "Ngongotaha", "Fairy Springs", "Kawaha Point",
          "Glenholme", "Fenton Park", "Lynmore",
        ],
      },
    },
    towns: ["Whakatane", "Taupo", "Opotiki", "Katikati", "Te Puke", "Kawerau"],
  },
  Northland: {
    cities: {
      Whangarei: {
        suburbs: [
          "Whangarei Central", "Tikipunga", "Kensington", "Onerahi", "Morningside",
          "Regent", "Riverside", "Raumanga", "Kamo", "Maunu",
        ],
      },
    },
    towns: ["Kerikeri", "Kaitaia", "Paihia", "Dargaville", "Mangawhai", "Waipu", "Russell"],
  },
  "Hawke's Bay": {
    cities: {
      Napier: {
        suburbs: [
          "Napier Central", "Taradale", "Greenmeadows", "Ahuriri", "Westshore",
          "Bay View", "Marewa", "Onekawa",
        ],
      },
      Hastings: {
        suburbs: [
          "Hastings Central", "Havelock North", "Flaxmere", "Mayfair", "Mahora", "Parkvale",
        ],
      },
    },
    towns: ["Waipukurau", "Wairoa"],
  },
  "Manawatu-Whanganui": {
    cities: {
      "Palmerston North": {
        suburbs: [
          "Palmerston North Central", "Hokowhitu", "Terrace End", "Fitzherbert",
          "Milson", "Kelvin Grove", "Awapuni", "Roslyn", "Takaro", "Highbury",
        ],
      },
    },
    towns: ["Whanganui", "Feilding", "Levin", "Marton", "Bulls", "Ohakune"],
  },
  Taranaki: {
    cities: {
      "New Plymouth": {
        suburbs: [
          "New Plymouth Central", "Fitzroy", "Merrilands", "Westown", "Vogeltown",
          "Brooklands", "Bell Block", "Waitara", "Strandon", "Moturoa",
        ],
      },
    },
    towns: ["Stratford", "Hawera", "Inglewood", "Opunake"],
  },
  Gisborne: {
    cities: {
      Gisborne: {
        suburbs: [
          "Gisborne Central", "Kaiti", "Mangapapa", "Riverdale", "Te Hapara",
          "Whataupoko", "Elgin", "Outer Kaiti",
        ],
      },
    },
    towns: ["Ruatoria", "Tokomaru Bay", "Tolaga Bay"],
  },
  Southland: {
    cities: {
      Invercargill: {
        suburbs: [
          "Invercargill Central", "Gladstone", "Appleby", "Waikiwi", "Richmond",
          "Hawthorndale", "Grasmere", "Strathern", "Rosedale",
        ],
      },
    },
    towns: ["Gore", "Te Anau", "Winton", "Bluff", "Riverton"],
  },
  Nelson: {
    cities: {
      Nelson: {
        suburbs: [
          "Nelson Central", "Stoke", "Tahunanui", "Atawhai", "The Wood",
          "The Brook", "Enner Glynn", "Bishopdale", "Toi Toi",
        ],
      },
    },
    towns: [],
  },
  Marlborough: {
    cities: {
      Blenheim: {
        suburbs: [
          "Blenheim Central", "Springlands", "Redwoodtown", "Witherlea", "Mayfield", "Riversdale",
        ],
      },
    },
    towns: ["Picton", "Havelock", "Seddon"],
  },
  Tasman: {
    cities: {},
    towns: ["Richmond", "Motueka", "Takaka", "Mapua", "Brightwater", "Wakefield", "Murchison"],
  },
  "West Coast": {
    cities: {},
    towns: ["Greymouth", "Hokitika", "Westport", "Reefton"],
  },
};

// Get the region for a given location name (case-insensitive)
export function getRegionForLocation(locationName: string): string | null {
  const lowerName = locationName.toLowerCase();

  for (const [region, data] of Object.entries(NZ_LOCATION_HIERARCHY)) {
    // Check if it's the region itself
    if (region.toLowerCase() === lowerName) {
      return region;
    }
    // Check cities and their suburbs
    for (const [city, cityData] of Object.entries(data.cities)) {
      if (city.toLowerCase() === lowerName) {
        return region;
      }
      if (cityData.suburbs.some((s) => s.toLowerCase() === lowerName)) {
        return region;
      }
    }
    // Check towns
    if (data.towns.some((t) => t.toLowerCase() === lowerName)) {
      return region;
    }
  }

  return null;
}

// Check if a location belongs to a specific region (case-insensitive)
export function isLocationInRegion(locationName: string, regionName: string): boolean {
  const lowerLocation = locationName.toLowerCase();
  const lowerRegion = regionName.toLowerCase();

  for (const [region, data] of Object.entries(NZ_LOCATION_HIERARCHY)) {
    if (region.toLowerCase() === lowerRegion) {
      // Check if the location IS the region itself
      if (lowerLocation === lowerRegion) {
        return true;
      }
      // Check cities and their suburbs
      for (const [city, cityData] of Object.entries(data.cities)) {
        if (city.toLowerCase() === lowerLocation) {
          return true;
        }
        if (cityData.suburbs.some((s) => s.toLowerCase() === lowerLocation)) {
          return true;
        }
      }
      // Check towns
      if (data.towns.some((t) => t.toLowerCase() === lowerLocation)) {
        return true;
      }
      return false;
    }
  }

  return false;
}

// Get the city for a given suburb (case-insensitive)
export function getCityForSuburb(suburbName: string): string | null {
  const lowerName = suburbName.toLowerCase();

  for (const data of Object.values(NZ_LOCATION_HIERARCHY)) {
    for (const [city, cityData] of Object.entries(data.cities)) {
      if (cityData.suburbs.some((s) => s.toLowerCase() === lowerName)) {
        return city;
      }
    }
  }

  return null;
}

// Check if a location is a city (has suburbs)
export function isCity(locationName: string): boolean {
  const lowerName = locationName.toLowerCase();

  for (const data of Object.values(NZ_LOCATION_HIERARCHY)) {
    for (const city of Object.keys(data.cities)) {
      if (city.toLowerCase() === lowerName) {
        return true;
      }
    }
  }

  return false;
}

// Check if a location is a town (no suburbs, belongs to a region)
export function isTown(locationName: string): boolean {
  const lowerName = locationName.toLowerCase();

  for (const data of Object.values(NZ_LOCATION_HIERARCHY)) {
    if (data.towns.some((t) => t.toLowerCase() === lowerName)) {
      return true;
    }
  }

  return false;
}

// Check if a location is a suburb
export function isSuburb(locationName: string): boolean {
  const lowerName = locationName.toLowerCase();

  for (const data of Object.values(NZ_LOCATION_HIERARCHY)) {
    for (const cityData of Object.values(data.cities)) {
      if (cityData.suburbs.some((s) => s.toLowerCase() === lowerName)) {
        return true;
      }
    }
  }

  return false;
}

// Get all cities and towns for a region
export function getCitiesAndTownsForRegion(regionName: string): { cities: string[]; towns: string[] } {
  const lowerRegion = regionName.toLowerCase();

  for (const [region, data] of Object.entries(NZ_LOCATION_HIERARCHY)) {
    if (region.toLowerCase() === lowerRegion) {
      return {
        cities: Object.keys(data.cities),
        towns: data.towns,
      };
    }
  }

  return { cities: [], towns: [] };
}

// Get all suburbs for a city
export function getSuburbsForCity(cityName: string): string[] {
  const lowerName = cityName.toLowerCase();

  for (const data of Object.values(NZ_LOCATION_HIERARCHY)) {
    for (const [city, cityData] of Object.entries(data.cities)) {
      if (city.toLowerCase() === lowerName) {
        return cityData.suburbs;
      }
    }
  }

  return [];
}

// Get location type: "region" | "city" | "town" | "suburb" | null
export function getLocationType(locationName: string): "region" | "city" | "town" | "suburb" | null {
  const lowerName = locationName.toLowerCase();

  // Check if it's a region
  for (const region of Object.keys(NZ_LOCATION_HIERARCHY)) {
    if (region.toLowerCase() === lowerName) {
      return "region";
    }
  }

  // Check cities, towns, and suburbs
  for (const data of Object.values(NZ_LOCATION_HIERARCHY)) {
    for (const [city, cityData] of Object.entries(data.cities)) {
      if (city.toLowerCase() === lowerName) {
        return "city";
      }
      if (cityData.suburbs.some((s) => s.toLowerCase() === lowerName)) {
        return "suburb";
      }
    }
    if (data.towns.some((t) => t.toLowerCase() === lowerName)) {
      return "town";
    }
  }

  return null;
}
