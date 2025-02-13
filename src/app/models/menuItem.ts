import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface SubMenuItem {
  id: string;
  title: string;
  icon?: IconDefinition;
  route?: string;
}

export interface MenuItem {
  id: string;
  title: string;
  subItems?: SubMenuItem[];
  expanded?: boolean;
  isSimple?: boolean;
  icon?: IconDefinition;
  route?: string;
}
