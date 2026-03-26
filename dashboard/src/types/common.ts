import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export interface Children {
  children: React.ReactNode;
}

export interface ClassName {
  className?: string;
}

export interface Id {
  id: number | string;
}

export interface Name {
  name: string;
}

export interface Title {
  title?: string;
}

export interface Description {
  description: string;
}

export interface Label {
  label: string;
}

export interface Value {
  value: string;
}

export interface Message {
  message?: string;
}

export interface Email {
  email: string;
}

export interface Href {
  href: string;
}

export interface Img {
  img: string;
}

export interface Icon {
  icon: IconDefinition;
}

export interface Color {
  color?: string;
}

export interface Amount {
  amount: string;
}

export interface Budget {
  budget: string;
}

export interface Completion {
  completion: number;
}

export interface Logo {
  logo: string;
}

export interface Alt {
  alt: string;
}

export interface Date {
  date: string;
}

export interface PaddingSize {
  paddingSize?: number;
}

export interface BackgroundColor {
  backgroundColor?: string;
}

export interface IconClass {
  iconClass?: string;
}

export interface IsVisible {
  isVisible: boolean;
}

export interface IsProfile {
  isProfile: boolean;
}

export interface DefaultChecked {
  defaultChecked: boolean;
}

export interface OnToggle {
  onToggle: (e: React.MouseEvent) => void;
}

export interface Time {
  time: string;
}

export interface BtnText {
  btnText: string;
}

export interface FocusRingColor {
  focusRingColor?: string;
}

// export interface AriaLabel {
//   ariaLabel: string;
// }

// export interface Type {
//   type?: string;
// }

export interface TextColor {
  textColor?: string;
}
