import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  loading: boolean;
  lastLoaded: number;
  refresh: () => void;
}

function LastUpdatedStamp({ loading, lastLoaded, refresh }: Props) {
  const [lastLoadedTimestamp, setLastLoadedTimestamp] = useState('');

  useEffect(() => {
    let intervalID: ReturnType<typeof setInterval> | null = null;

    const _call = () => {
      const fn = () => {
        if (intervalID) {
          clearInterval(intervalID);
        }
        setLastLoadedTimestamp(
          formatDistanceToNow(new Date(lastLoaded), { addSuffix: false, includeSeconds: true }),
        );

        // keep calling the function on interval
        intervalID = setInterval(fn, 1000 * 60);
      };

      // first run
      fn();
    };

    if (!lastLoaded) {
      return;
    }

    _call();
  }, [lastLoaded]);

  return (
    <div className="text-0.875 p-2">
      {loading ? (
        <span>Loading...</span>
      ) : (
        <span>
          Last Updated <b>{lastLoadedTimestamp}</b> ago
        </span>
      )}

      <button className="ml-1" onClick={() => refresh()}>
        ⟳
      </button>
    </div>
  );
}

export default LastUpdatedStamp;
