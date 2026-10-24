import { useOutletContext } from 'react-router';

export interface LayoutContext {
  /** Open the "Add an action" dialog, optionally preselecting a pillar. */
  openAddAction: (pillarId?: string) => void;
}

export const useLayout = () => useOutletContext<LayoutContext>();
