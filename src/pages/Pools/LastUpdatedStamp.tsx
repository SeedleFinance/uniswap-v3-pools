import React, { useEffect, useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  loading: boolean;
  lastLoaded: number;
  refresh: () => void;
}

function LastUpdatedStamp({ loading, lastLoaded, refresh }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalID = setInterval(() => setTick(+new Date()), 1000 * 60);
    return () => clearInterval(intervalID);
  }, []);

  // auto-refresh every 10 mins
  useEffect(() => {
    const autoRefreshDelay = 1000 * 60 * 10; //every 10 mins
    if (tick - lastLoaded > autoRefreshDelay) {
      refresh();
    }
  }, [tick, lastLoaded, refresh]);

  const lastLoadedTimestamp = useMemo(() => {
    if (tick > -1) {
      return formatDistanceToNow(new Date(lastLoaded), { addSuffix: false, includeSeconds: true });
    }
  }, [tick, lastLoaded]);

  return (
    <div className="text-0.875 p-2">
      {loading ? (
        <span>Loading...</span>
      ) : (
        <>
          <span>
            Last Updated <b>{lastLoadedTimestamp}</b> ago
          </span>
          <button className="ml-1" onClick={() => refresh()}>
            ⟳
          </button>
        </>
      )}
    </div>
  );
}

export default LastUpdatedStamp;
