import {
  Amount,
  ClassName,
  Color,
  Completion,
  Date,
  Description,
  Icon,
  Id,
  Img,
  Label,
  Message,
  Name,
  TextColor,
  Title,
  Value,
} from "./common";

export interface Stat extends Id, Title, TextColor, Icon, Value {
  change: string;
}

export interface PaymentStat
  extends Id,
    Title,
    Description,
    Icon,
    ClassName,
    Amount {}

export interface ChartMetic extends Id, Icon, Color, Completion, Label {
  value: string;
  width: string;
}

export interface TimelineData extends Id, Title, Icon, Date {
  iconColor: string;
}

export interface Chat extends Id, Name, Message, Img {}

export interface Participant extends Id, Name, Img {}

export interface Project extends Id, Img, Title, Description {
  category: string;
  participants: Participant[];
}
