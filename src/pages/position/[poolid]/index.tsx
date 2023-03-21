import React from 'react';
import PositionDetailsLayout from '../../../layouts/PositionDetailsLayout';
import { usePools } from '../../../providers/CombinedPoolsProvider';

const PositionDetailsPage = () => {
  const { loading, pools } = usePools();

  if (loading) {
    return (
      <div className="w-full h-full">
        <div className="flex items-center">
          <div className="flex flex-col">
            <div className="bg-surface-10 rounded w-32 h-4"></div>
            <div className="bg-surface-10 rounded-sm w-96 h-12 mt-4"></div>
          </div>
        </div>
        <div className="bg-surface-10 rounded w-full h-20 mt-8"></div>
        <div className="bg-surface-10 rounded w-full h-20 mt-4"></div>
      </div>
    );
  }

  return <PositionDetailsLayout pools={pools} />;
};

export default PositionDetailsPage;
