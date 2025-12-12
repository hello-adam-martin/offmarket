"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AddressComponents {
  streetNumber?: string;
  route?: string;
  sublocality?: string;
  locality?: string;
  administrativeArea?: string;
  postalCode?: string;
  country?: string;
}

interface SelectedAddress {
  formattedAddress: string;
  components: AddressComponents;
  lat?: number;
  lng?: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (address: SelectedAddress) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
}

// Declare google global type
declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces?: () => void;
  }
}

// Track if script is loading
let isLoading = false;
let isLoaded = false;

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing an address...",
  className = "",
  required,
  id,
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isReady, setIsReady] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load Google Places script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.warn("Google Places API key not configured");
      return;
    }

    if (isLoaded && window.google?.maps?.places) {
      initializeServices();
      return;
    }

    if (isLoading) {
      // Wait for script to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkLoaded);
          initializeServices();
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    isLoading = true;

    // Create callback
    window.initGooglePlaces = () => {
      isLoaded = true;
      isLoading = false;
      initializeServices();
    };

    // Load script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const initializeServices = () => {
    if (!window.google?.maps?.places) return;

    autocompleteService.current = new window.google.maps.places.AutocompleteService();

    // Create a hidden div for PlacesService (required by the API)
    const container = document.createElement("div");
    placesService.current = new window.google.maps.places.PlacesService(container);

    setIsReady(true);
  };

  // Handle input change with debounce
  const handleInputChange = useCallback(
    (inputValue: string) => {
      onChange(inputValue);

      if (!isReady || !autocompleteService.current) return;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (inputValue.length < 3) {
        setPredictions([]);
        setShowDropdown(false);
        return;
      }

      debounceTimer.current = setTimeout(() => {
        autocompleteService.current!.getPlacePredictions(
          {
            input: inputValue,
            componentRestrictions: { country: "nz" },
            types: ["address"],
          },
          (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              setPredictions(results);
              setShowDropdown(true);
              setSelectedIndex(-1);
            } else {
              setPredictions([]);
              setShowDropdown(false);
            }
          }
        );
      }, 300);
    },
    [isReady, onChange]
  );

  // Handle selecting a prediction
  const handleSelectPrediction = useCallback(
    (prediction: google.maps.places.AutocompletePrediction) => {
      onChange(prediction.description);
      setPredictions([]);
      setShowDropdown(false);

      if (!placesService.current || !onSelect) return;

      // Get place details
      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ["address_components", "formatted_address", "geometry"],
        },
        (place, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) return;

          const components: AddressComponents = {};

          place.address_components?.forEach((component) => {
            const type = component.types[0];
            switch (type) {
              case "street_number":
                components.streetNumber = component.long_name;
                break;
              case "route":
                components.route = component.long_name;
                break;
              case "sublocality_level_1":
              case "sublocality":
              case "neighborhood":
                components.sublocality = component.long_name;
                break;
              case "locality":
                components.locality = component.long_name;
                break;
              case "administrative_area_level_1":
                components.administrativeArea = component.long_name;
                break;
              case "postal_code":
                components.postalCode = component.long_name;
                break;
              case "country":
                components.country = component.long_name;
                break;
            }
          });

          onSelect({
            formattedAddress: place.formatted_address || prediction.description,
            components,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
          });
        }
      );
    },
    [onChange, onSelect]
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectPrediction(predictions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        break;
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => predictions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={`input ${className}`}
      />

      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelectPrediction(prediction)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                index === selectedIndex
                  ? "bg-primary-50 text-primary-700"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <div className="font-medium">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-500">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </button>
          ))}
          <div className="px-4 py-2 text-xs text-gray-400 border-t flex items-center gap-1">
            <span>Powered by</span>
            <img
              src="https://developers.google.com/static/maps/documentation/images/google_on_white.png"
              alt="Google"
              className="h-3"
            />
          </div>
        </div>
      )}
    </div>
  );
}
