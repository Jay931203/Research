'use client';

import MambaSSMCoreViz from './MambaSSMCoreViz';
import CnnVsSsmViz from './CnnVsSsmViz';
import SSMExponentialModeViz from './SSMExponentialModeViz';

export default function MambaCompositeViz() {
  return (
    <div className="space-y-6">
      <MambaSSMCoreViz />
      <CnnVsSsmViz />
      <SSMExponentialModeViz />
    </div>
  );
}
