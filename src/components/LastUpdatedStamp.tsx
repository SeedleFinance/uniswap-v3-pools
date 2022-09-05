import React, { useEffect, useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import classNames from "classnames";

import IconRefresh from "../components/icons/Refresh";
import LoadingSpinner from "./Spinner";

interface Props {
  loading: boolean;
  lastLoaded: number;
  refresh: () => void;
  className?: string;
}

function LastUpdatedStamp({ loading, lastLoaded, refresh, className }: Props) {
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
      return formatDistanceToNow(new Date(lastLoaded), {
        addSuffix: false,
        includeSeconds: false,
      });
    }
  }, [tick, lastLoaded]);

  return (
    <div className={"flex items-center text-0.6875 text-medium"}>
      {loading ? (
        <span>
          <LoadingSpinner size={20} color="text-high" />
        </span>
      ) : (
        <div className={classNames("flex items-center", className)}>
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
