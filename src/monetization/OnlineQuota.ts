import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

const KEY = 'online_quota_v1';

type Quota = { weekKey: string; count: number };

const getWeekKey = () => {
  // semaine locale ISO (lundi)
  return dayjs().isoWeekYear() + '-' + dayjs().isoWeek();
};

export async function getQuota(): Promise<Quota> {
  const raw = await AsyncStorage.getItem(KEY);
  const wk = getWeekKey();
  if (!raw) return { weekKey: wk, count: 0 };
  const q: Quota = JSON.parse(raw);
  if (q.weekKey !== wk) return { weekKey: wk, count: 0 };
  return q;
}

export async function increment(): Promise<Quota> {
  const wk = getWeekKey();
  const q = await getQuota();
  const next = { weekKey: wk, count: q.count + 1 };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function resetWeek() {
  const wk = getWeekKey();
  const next = { weekKey: wk, count: 0 };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
