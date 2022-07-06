import React, { useEffect, useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import IconRefresh from '../../icons/Refresh';
import { Button } from '../../ui/Button';
import LoadingSpinner from '../../ui/Spinner';

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
    <div className="flex items-center text-0.75 md:text-0.875 text-medium">
      {loading ? (
        <span>
          <LoadingSpinner size={20} color="text-high" />
        </span>
      ) : (
        <div className="flex items-center">
          <span>
            Updated <span>{lastLoadedTimestamp}</span> ago
          </span>
          <button className="ml-1" onClick={refresh}>
            <IconRefresh />
          </button>
        </div>
      )}
    </div>
  );
}

export default LastUpdatedStamp;
