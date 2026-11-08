import useSWR from 'swr';

export function useAlerts() {
  const { data, error } = useSWR('/api/alerts', (url: string) => fetch(url).then(r => r.json()));
  return { alerts: data || [], isLoading: !error && !data, isError: !!error };
}
