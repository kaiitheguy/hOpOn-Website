import type { StructuredAddress } from './types';

interface MapboxContextItem {
  name?: string;
  region_code?: string;
  region_code_full?: string;
  country_code?: string;
  country_code_alpha_3?: string;
}

interface MapboxFeature {
  id?: string;
  properties?: {
    mapbox_id?: string;
    feature_type?: string;
    name?: string;
    full_address?: string;
    coordinates?: { latitude?: number; longitude?: number };
    context?: {
      address?: MapboxContextItem;
      place?: MapboxContextItem;
      region?: MapboxContextItem;
      postcode?: MapboxContextItem;
      country?: MapboxContextItem;
    };
  };
  geometry?: { coordinates?: number[] };
}

interface MapboxV5Feature {
  id?: string;
  address?: string;
  text?: string;
  place_type?: string[];
  place_name?: string;
  center?: number[];
  context?: { id?: string; short_code?: string; text?: string }[];
}

const MAPBOX_V6_URL = 'https://api.mapbox.com/search/geocode/v6/forward';
const MAPBOX_V5_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

function getMapboxToken(): string {
  const runtime = typeof window !== 'undefined' ? window.__RUNTIME_CONFIG__ : undefined;
  const token =
    runtime?.VITE_MAPBOX_ACCESS_TOKEN ??
    runtime?.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ??
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ??
    import.meta.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ??
    '';
  return token.trim();
}

function mergeStreetParts(primary: string, secondary: string): string {
  const a = primary.trim();
  const b = secondary.trim();
  if (!a) return b;
  if (!b) return a;
  if (a.toLowerCase() === b.toLowerCase()) return b;
  if (a.toLowerCase().startsWith(b.toLowerCase())) return a;
  if (b.toLowerCase().startsWith(a.toLowerCase())) return b;
  return `${a} ${b}`;
}

function normalizeState(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.includes('-')) return trimmed;
  const parts = trimmed.split('-');
  return parts[parts.length - 1]?.trim() || trimmed;
}

function parseCoordinates(feature: MapboxFeature): { latitude: number; longitude: number } | null {
  const latitude = feature.properties?.coordinates?.latitude;
  const longitude = feature.properties?.coordinates?.longitude;
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return { latitude, longitude };
  }
  const coords = feature.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { latitude: lat, longitude: lng };
}

function toStructuredAddress(feature: MapboxFeature): StructuredAddress | null {
  const props = feature.properties;
  if (!props || props.feature_type !== 'address') return null;
  const coordinates = parseCoordinates(feature);
  if (!coordinates) return null;

  const formattedAddress = props.full_address?.trim() || '';
  const streetAddress = mergeStreetParts(props.context?.address?.name || '', props.name || '');
  const city = props.context?.place?.name?.trim() || '';
  const state = normalizeState(
    props.context?.region?.region_code ||
      props.context?.region?.region_code_full ||
      props.context?.region?.name ||
      ''
  );
  const zipCode = props.context?.postcode?.name?.trim() || '';
  const country = (
    props.context?.country?.country_code ||
    props.context?.country?.country_code_alpha_3 ||
    props.context?.country?.name ||
    'US'
  ).toUpperCase();
  const mapboxId = props.mapbox_id?.trim() || feature.id?.trim() || '';
  if (!formattedAddress || !streetAddress || !mapboxId) return null;
  return {
    formatted_address: formattedAddress,
    street_address: streetAddress,
    city,
    state,
    zip_code: zipCode,
    country,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    mapbox_id: mapboxId,
  };
}

function parseV5Context(context: MapboxV5Feature['context'], prefix: string) {
  return (context || []).find((item) => item.id?.startsWith(prefix));
}

function toStructuredAddressFromV5(feature: MapboxV5Feature): StructuredAddress | null {
  if (!(feature.place_type || []).includes('address')) return null;
  if (!Array.isArray(feature.center) || feature.center.length < 2) return null;
  const longitude = Number(feature.center[0]);
  const latitude = Number(feature.center[1]);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  const streetAddress = mergeStreetParts(feature.address || '', feature.text || '');
  const formattedAddress = feature.place_name?.trim() || '';
  const region = parseV5Context(feature.context, 'region.');
  const mapboxId = feature.id?.trim() || '';
  if (!streetAddress || !formattedAddress || !mapboxId) return null;
  return {
    formatted_address: formattedAddress,
    street_address: streetAddress,
    city: parseV5Context(feature.context, 'place.')?.text?.trim() || '',
    state: normalizeState((region?.short_code || region?.text || '').trim()),
    zip_code: parseV5Context(feature.context, 'postcode.')?.text?.trim() || '',
    country: (parseV5Context(feature.context, 'country.')?.short_code || 'US').toUpperCase(),
    latitude,
    longitude,
    mapbox_id: mapboxId,
  };
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  const response = await fetch(url, { method: 'GET', signal });
  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, data: (await response.json()) as T };
}

export function hasMapboxToken(): boolean {
  return !!getMapboxToken();
}

export async function searchStreetAddresses(
  query: string,
  options?: { limit?: number; signal?: AbortSignal }
): Promise<StructuredAddress[]> {
  const trimmed = query.trim();
  const token = getMapboxToken();
  if (!trimmed || !token) return [];

  const params = new URLSearchParams({
    q: trimmed,
    country: 'us',
    types: 'address',
    autocomplete: 'true',
    limit: String(options?.limit ?? 5),
    access_token: token,
  });

  const v6 = await fetchJson<{ features?: MapboxFeature[] }>(`${MAPBOX_V6_URL}?${params.toString()}`, options?.signal);
  if (v6.ok) {
    return (v6.data.features || []).map(toStructuredAddress).filter((item): item is StructuredAddress => item != null);
  }

  const v6Failure = v6 as { ok: false; status: number };
  if (v6Failure.status === 404 || v6Failure.status === 410) {
    const v5Params = new URLSearchParams({
      country: 'us',
      types: 'address',
      autocomplete: 'true',
      limit: String(options?.limit ?? 5),
      access_token: token,
    });
    const v5 = await fetchJson<{ features?: MapboxV5Feature[] }>(
      `${MAPBOX_V5_URL}/${encodeURIComponent(trimmed)}.json?${v5Params.toString()}`,
      options?.signal
    );
    if (!v5.ok) return [];
    return (v5.data.features || []).map(toStructuredAddressFromV5).filter((item): item is StructuredAddress => item != null);
  }

  return [];
}
