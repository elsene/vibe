import { useCallback, useEffect, useState } from 'react';
import { getQuota, increment } from './OnlineQuota';
import { usePremium } from './PremiumProvider';
import { WEEKLY_ONLINE_FREE_LIMIT } from './constants';

export function useOnlineQuota() {
  const { isPremium } = usePremium();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const q = await getQuota();
    setCount(q.count);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const tryConsume = useCallback(async () => {
    if (isPremium) return { allowed: true, count };
    const q = await getQuota();
    if (q.count >= WEEKLY_ONLINE_FREE_LIMIT) return { allowed: false, count: q.count };
    const n = await increment();
    setCount(n.count);
    return { allowed: true, count: n.count };
  }, [isPremium, count]);

  return {
    count,
    loading,
    tryConsume,
    refresh,
    remaining: Math.max(0, WEEKLY_ONLINE_FREE_LIMIT - count)
  };
}
