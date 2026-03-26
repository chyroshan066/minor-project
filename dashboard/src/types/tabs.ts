import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export interface BaseTab {
  value: string | number;
}

export interface SimpleTab extends BaseTab {
  label: string;
}

export interface IconTab extends SimpleTab {
  icon: IconDefinition;
}

export interface MetadataTab extends IconTab {
  disabled?: boolean;
  badge?: number;
}
