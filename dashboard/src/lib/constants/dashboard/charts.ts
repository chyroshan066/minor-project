import { ChartMetic } from "@/types";
import {
  faCreditCard,
  faFileLines,
  faRocket,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";

export const CHART_METRICS: ChartMetic[] = [
  {
    id: 1,
    label: "Users",
    value: "36K",
    completion: 60,
    icon: faFileLines,
    color: "bg-gradient-soft-purple700-pink500",
    width: "w-3/5",
  },
  {
    id: 2,
    label: "Clicks",
    value: "2m",
    completion: 90,
    icon: faRocket,
    color: "bg-gradient-soft-blue600-cyan400",
    width: "w-9/10",
  },
  {
    id: 3,
    label: "Sales",
    value: "435$",
    completion: 30,
    icon: faCreditCard,
    color: "bg-gradient-soft-red500-yellow400",
    width: "w-3/10",
  },
  {
    id: 4,
    label: "Items",
    value: "43",
    completion: 50,
    icon: faWrench,
    color: "bg-gradient-soft-red600-rose400",
    width: "w-1/2",
  },
];
