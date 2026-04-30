export interface PanelCategory {
  id: string;
  name: string;
}

export interface PanelTemplate {
  title: string;
  description: string;
  type: 'select' | 'buttons';
  categories: PanelCategory[];
}

const SHARED_CATEGORIES: PanelCategory[] = [
  { id: 'billing', name: 'Billing' },
  { id: 'technical', name: 'Technical Issue' },
  { id: 'account', name: 'Account Problem' },
  { id: 'other', name: 'Other' },
];

export const SELECT_PANEL: PanelTemplate = {
  title: 'Support Tickets',
  description: 'Open a support ticket by choosing a category below.',
  type: 'select',
  categories: SHARED_CATEGORIES,
};

export const BUTTONS_PANEL: PanelTemplate = {
  title: 'Support Tickets',
  description: 'Click a button to open a support ticket.',
  type: 'buttons',
  categories: SHARED_CATEGORIES,
};
