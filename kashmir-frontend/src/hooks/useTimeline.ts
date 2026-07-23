import useSWR from 'swr';
import { api } from '@/lib/api';
import { MOCK_TIMELINE } from '@/lib/mockData';
import { TIMELINE_IMAGES } from '@/lib/timelineImages';
import type { TimelineEvent } from '@/types/api';

const fetcher = () => api.timeline().then(r => r?.events ?? null);

function withLocalImages(events: TimelineEvent[]): TimelineEvent[] {
  return events.map(ev => ({
    ...ev,
    imgUrl: ev.imgUrl ?? TIMELINE_IMAGES[ev.title],
  }));
}

export function useTimeline() {
  const { data, error, isLoading } = useSWR<TimelineEvent[] | null>(
    'timeline',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900_000 }
  );

  const base = data ?? MOCK_TIMELINE;

  return {
    events:    withLocalImages(base),
    isLoading,
    isError:   !!error,
    isMock:    !data && !isLoading,
  };
}
