import { Href, Icon, Id, Name } from "./common";

export interface NavLink extends Name, Href {}

export interface BaseLink extends Id, NavLink {}

export interface Link extends BaseLink, Icon {}
