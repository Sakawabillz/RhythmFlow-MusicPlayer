import axios from 'axios';

export async function searchTracks(query) {
  if (!query?.trim()) return [];
  const url = `/deezer/search?q=${encodeURIComponent(query)}`;
  const { data } = await axios.get(url);
  return data?.data || [];
}
