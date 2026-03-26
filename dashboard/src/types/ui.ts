import {
  BtnText,
  DefaultChecked,
  Href,
  Icon,
  Id,
  IsVisible,
  Label,
  Message,
  Time,
  Title,
} from "./common";

export interface AlertState extends Title, Message, IsVisible {
  type: "success" | "error";
}

interface BaseNotification extends Id, Href, Title, Message, Time {}

interface ImageNotification extends BaseNotification {
  type: "image" | "logo";
  asset: string;
}

interface IconNotification extends BaseNotification {
  type: "icon";
  asset: Icon["icon"];
}

export type Notification = ImageNotification | IconNotification;

export interface Setting extends Label, DefaultChecked {
  id: string;
}

export interface FooterSocialLink extends Id, Icon, Href {}

export interface SocialShareButton extends Id, BtnText, Icon, Href {}
