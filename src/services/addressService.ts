// Address Service for MokMzansi Books
// Uses the free Nominatim OpenStreetMap API for geocoding

export interface AddressResult {
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  lat: string;
  lon: string;
}

export interface FormattedAddress {
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

/**
 * Search for address suggestions based on a query
 * @param query The address search query
 * @returns Promise with address results
 */
export async function searchAddress(query: string): Promise<AddressResult[]> {
  try {
    // Use Nominatim OpenStreetMap API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&limit=5&countrycodes=za`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'MokMzansiBooks/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Address search failed');
    }

    const data = await response.json();
    return data as AddressResult[];
  } catch (error) {
    console.error('Error searching for address:', error);
    return [];
  }
}

/**
 * Format an address result into a structured address object
 * @param result The address result from the search
 * @returns Formatted address object
 */
export function formatAddress(result: AddressResult): FormattedAddress {
  const { address } = result;
  
  // Construct street address from available components
  const streetParts = [];
  if (address.house_number) streetParts.push(address.house_number);
  if (address.road) streetParts.push(address.road);
  
  return {
    streetAddress: streetParts.join(' ') || '',
    city: address.city || address.suburb || '',
    province: address.state || '',
    postalCode: address.postcode || '',
    country: address.country || 'South Africa',
  };
}
