import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  lastLoaded: number;
  refresh: () => void;
}

function LastUpdatedStamp({ lastLoaded, refresh }: Props) {
  const [lastLoadedTimestamp, setLastLoadedTimestamp] = useState('');

  useEffect(() => {
    let intervalID: ReturnType<typeof setInterval> | null = null;

    const _call = () => {
      if (intervalID) {
        clearInterval(intervalID);
      }

      intervalID = setInterval(() => {
        setLastLoadedTimestamp(
          formatDistanceToNow(new Date(lastLoaded), { addSuffix: false, includeSeconds: true }),
        );
      }, 1000 * 60);
    };

    if (!lastLoaded) {
      return;
    }

    _call();
  }, [lastLoaded]);

  if (!lastLoaded) {
    return null;
  }

  return (
    <div className="text-0.875 p-2">
      <span>
        Last Updated <b>{lastLoadedTimestamp}</b> ago
      </span>
      <button className="ml-1" onClick={() => refresh()}>
        ⟳
      </button>
    </div>
  );
}

export default LastUpdatedStamp;
