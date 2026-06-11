import React from 'react';
import { MapPin } from 'lucide-react';
import { hasMapboxToken, searchStreetAddresses } from '../../lib/merchant/mapboxAddress';
import type { StructuredAddress } from '../../lib/merchant/types';

export function AddressAutocomplete({
  value,
  selectedAddress,
  onChange,
  onSelectAddress,
  placeholder,
  isZh,
  error,
}: {
  value: string;
  selectedAddress: StructuredAddress | null;
  onChange: (value: string) => void;
  onSelectAddress: (address: StructuredAddress | null) => void;
  placeholder?: string;
  isZh: boolean;
  error?: string | null;
}) {
  const [suggestions, setSuggestions] = React.useState<StructuredAddress[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const tokenAvailable = hasMapboxToken();

  React.useEffect(() => {
    if (!tokenAvailable) return;
    if (selectedAddress?.formatted_address === value) {
      setSuggestions([]);
      return;
    }
    const trimmed = value.trim();
    if (trimmed.length < 4) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      searchStreetAddresses(trimmed, { signal: controller.signal })
        .then((items) => {
          setSuggestions(items);
          setOpen(true);
        })
        .catch((err) => {
          if ((err as Error).name !== 'AbortError') setSuggestions([]);
        })
        .finally(() => setSearching(false));
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [selectedAddress?.formatted_address, tokenAvailable, value]);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            onSelectAddress(null);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={`w-full h-12 border-2 pl-10 pr-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red ${
            error ? 'border-hopon-red' : 'border-black'
          }`}
        />
      </div>
      {searching && <p className="mt-1 text-xs text-black/50">{isZh ? '正在搜索地址...' : 'Searching addresses...'}</p>}
      {!tokenAvailable && (
        <p className="mt-1 text-xs text-hopon-red">
          {isZh
            ? '缺少 Mapbox token，无法选择有效街道地址。请配置 VITE_MAPBOX_ACCESS_TOKEN。'
            : 'Missing Mapbox token. Set VITE_MAPBOX_ACCESS_TOKEN to select a valid street address.'}
        </p>
      )}
      {error && <p className="mt-1 text-xs text-hopon-red">{error}</p>}
      {selectedAddress && !error && (
        <p className="mt-1 text-xs text-black/50">
          {isZh ? '已选择：' : 'Selected: '}
          {selectedAddress.formatted_address}
        </p>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto border-2 border-black bg-white shadow-lg">
          {suggestions.map((item) => (
            <button
              key={item.mapbox_id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelectAddress(item);
                onChange(item.formatted_address);
                setOpen(false);
                setSuggestions([]);
              }}
              className="block w-full border-b border-black/10 px-4 py-3 text-left hover:bg-hopon-grey"
            >
              <p className="font-mono text-sm text-hopon-black">{item.street_address}</p>
              <p className="mt-1 text-xs text-black/55">{item.formatted_address}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
