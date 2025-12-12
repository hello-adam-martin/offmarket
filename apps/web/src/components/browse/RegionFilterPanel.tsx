"use client";

import { useSession } from "next-auth/react";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";

// NZ Location hierarchy - synced with API's nz-locations.ts
// In a real app, you might fetch this from the API or share via a package
interface CityData {
  suburbs: string[];
}

interface RegionData {
  cities: Record<string, CityData>;
  towns: string[];
}

const NZ_LOCATION_HIERARCHY: Record<string, RegionData> = {
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

export interface RegionFilters {
  city: string | null;
  suburb: string | null;
  propertyTypes: string[];
  bedroomsMin: number | null;
}

interface RegionFilterPanelProps {
  regionName: string;
  filters: RegionFilters;
  onChange: (filters: Partial<RegionFilters>) => void;
  onClear: () => void;
  onSaveSearch?: () => void;
}

const BEDROOM_OPTIONS = [
  { value: null, label: "Any" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
];

export function RegionFilterPanel({ regionName, filters, onChange, onClear, onSaveSearch }: RegionFilterPanelProps) {
  const { data: session } = useSession();
  const regionData = NZ_LOCATION_HIERARCHY[regionName];

  // Get cities and towns for this region
  const cities = regionData ? Object.keys(regionData.cities) : [];
  const towns = regionData?.towns || [];
  const citiesAndTowns = [...cities, ...towns].sort();

  // Get suburbs for selected city (if it's a city, not a town)
  const selectedCityData = filters.city && regionData?.cities[filters.city];
  const suburbs = selectedCityData ? selectedCityData.suburbs.slice().sort() : [];

  const hasActiveFilters = filters.city || filters.suburb || filters.propertyTypes.length > 0 || filters.bedroomsMin;

  const handlePropertyTypeToggle = (type: string) => {
    const current = filters.propertyTypes;
    const newTypes = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ propertyTypes: newTypes });
  };

  const handleCityChange = (city: string | null) => {
    onChange({ city, suburb: null }); // Reset suburb when city changes
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 py-3">
          {/* City/Town dropdown */}
          {citiesAndTowns.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">City/Town:</label>
                <select
                  value={filters.city || ""}
                  onChange={(e) => handleCityChange(e.target.value || null)}
                  className="text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 px-3 py-1.5"
                >
                  <option value="">All {regionName}</option>
                  {citiesAndTowns.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-4 w-px bg-gray-300" />
            </>
          )}

          {/* Suburb dropdown - only show if city is selected and has suburbs */}
          {suburbs.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">Suburb:</label>
                <select
                  value={filters.suburb || ""}
                  onChange={(e) => onChange({ suburb: e.target.value || null })}
                  className="text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 px-3 py-1.5"
                >
                  <option value="">All {filters.city}</option>
                  {suburbs.map((suburb) => (
                    <option key={suburb} value={suburb}>
                      {suburb}
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-4 w-px bg-gray-300" />
            </>
          )}

          {/* Bedrooms dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Beds:</label>
            <select
              value={filters.bedroomsMin ?? ""}
              onChange={(e) => onChange({ bedroomsMin: e.target.value ? parseInt(e.target.value, 10) : null })}
              className={`text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 px-3 py-1.5 ${
                filters.bedroomsMin ? "font-medium text-gray-900" : "text-gray-500"
              }`}
            >
              {BEDROOM_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ""}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-gray-300" />

          {/* Property type pills */}
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-1.5">
              {Object.entries(PROPERTY_TYPE_LABELS).map(([type, label]) => {
                const isSelected = filters.propertyTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => handlePropertyTypeToggle(type)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Search button */}
          {session && onSaveSearch && (
            <button
              onClick={onSaveSearch}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 whitespace-nowrap ml-2"
              title="Save this search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Save
            </button>
          )}

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap ml-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
