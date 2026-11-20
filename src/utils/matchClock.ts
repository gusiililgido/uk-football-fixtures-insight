import { MatchStatus } from '../types';

export interface LiveMatchTiming {
  phase: 'UPCOMING' | 'LIVE_90' | 'ENDED_WAIT_ADMIN' | 'SETTLED';
  label: string;
  subLabel: string;
  minuteNumber?: number;
  progressPercent?: number;
}

/**
 * Parses matchDate (YYYY-MM-DD) + kickoffTime (e.g. "20:00 EAT" or "17:30") in EAT (+03:00)
 */
export function parseKickoffTimestamp(matchDate: string, kickoffTime: string): number | null {
  if (!matchDate) return null;
  const timeMatch = kickoffTime.match(/(\d{1,2}):(\d{2})/);
  const hh = timeMatch ? timeMatch[1].padStart(2, '0') : '18';
  const mm = timeMatch ? timeMatch[2].padStart(2, '0') : '00';
  const isoString = `${matchDate}T${hh}:${mm}:00+03:00`;
  const ts = Date.parse(isoString);
  return Number.isNaN(ts) ? null : ts;
}

export function getLiveMatchTiming(
  matchDate: string,
  kickoffTime: string,
  status: MatchStatus,
  nowMs: number
): LiveMatchTiming {
  if (status !== 'PENDING') {
    return {
      phase: 'SETTLED',
      label: status === 'WON' ? 'SETTLED • WON' : status === 'LOST' ? 'SETTLED • LOST' : 'POSTPONED',
      subLabel: 'Official Result Verified',
    };
  }

  const kickoffMs = parseKickoffTimestamp(matchDate, kickoffTime);
  if (!kickoffMs) {
    return {
      phase: 'UPCOMING',
      label: `Kickoff: ${kickoffTime}`,
      subLabel: matchDate,
    };
  }

  const diffMs = kickoffMs - nowMs;

  // 1. Before Kickoff -> Live Countdown
  if (diffMs > 0) {
    const totalSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    const countdownStr =
      days > 0
        ? `${days}d ${pad(hours)}h ${pad(mins)}m`
        : `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;

    return {
      phase: 'UPCOMING',
      label: `Starts in ${countdownStr}`,
      subLabel: `${matchDate} • ${kickoffTime}`,
    };
  }

  // 2. Match In Progress -> 90-Minute Live Countdown/Clock (105 mins window incl. 15m Halftime)
  const elapsedMins = Math.floor((nowMs - kickoffMs) / 60000);
  if (elapsedMins < 105) {
    let displayMin = elapsedMins + 1;
    let periodNote = '1st Half Live';
    if (elapsedMins >= 45 && elapsedMins < 60) {
      displayMin = 45;
      periodNote = 'Half Time (HT)';
    } else if (elapsedMins >= 60) {
      displayMin = Math.min(90, elapsedMins - 14);
      periodNote = '2nd Half Live';
    }
    const remaining90 = Math.max(0, 90 - displayMin);
    const pct = Math.min(100, Math.round((displayMin / 90) * 100));

    return {
      phase: 'LIVE_90',
      label: periodNote === 'Half Time (HT)' ? 'LIVE • HALF TIME' : `LIVE • ${displayMin}' MIN`,
      subLabel: `${remaining90} mins remaining in 90'`,
      minuteNumber: displayMin,
      progressPercent: pct,
    };
  }

  // 3. 90 Minutes Ended -> Mark End, Waiting for Admin Result Update
  return {
    phase: 'ENDED_WAIT_ADMIN',
    label: '90\' ENDED (FT)',
    subLabel: 'Waiting for Admin Result Update',
    minuteNumber: 90,
    progressPercent: 100,
  };
}
