// import { cn } from "@/lib/utils";
import {
  BackgroundColor,
  BtnText,
  ClassName,
  FocusRingColor,
  TextColor,
} from "@/types";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { cva, type VariantProps } from "class-variance-authority";

// const buttonVariants = cva(
//   "inline-block font-bold text-center uppercase align-middle transition-all rounded-lg cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 active:opacity-85 tracking-tight-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:scale-102",
//   {
//     variants: {
//       variant: {
//         outline:
//           "mb-0 border border-solid shadow-none hover:opacity-75 bg-transparent",
//         gradient:
//           "text-surface shadow-soft-md bg-150 hover:shadow-soft-xs active:opacity-85 bg-x-25",
//       },
//       size: {
//         outline: "px-8 py-2",
//         gradient: "px-6 py-3",
//       },
//       color: {
//         fuchsia: "border-primary text-primary", // Full classes!
//         // slate: "border-muted text-muted",
//       },
//     },
//     defaultVariants: {
//       variant: "outline",
//       size: "outline",
//     },
//   }
// );

const variants = {
  outline:
    "mb-0 border border-solid shadow-none hover:opacity-75 bg-transparent",
  gradient:
    "text-surface shadow-soft-md bg-150 hover:shadow-soft-xs active:opacity-85 bg-x-25",
};

const defaultPaddingX = {
  outline: "px-8",
  gradient: "px-6",
};

const defaultPaddingY = {
  outline: "py-2",
  gradient: "py-3",
};

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ClassName,
    BackgroundColor,
    BtnText,
    FocusRingColor,
    TextColor {
  icon?: IconDefinition;
  variant?: keyof typeof variants;
  paddingX?: string;
  paddingY?: string;
  borderColor?: string;
}

export const Button = ({
  className,
  btnText,
  backgroundColor,
  icon,
  variant = "outline",
  paddingX,
  paddingY,
  borderColor = "border-primary",
  textColor = "text-primary",
  focusRingColor = "focus-visible:ring-primary-ring/50",
  type = "button",
  ...props
}: ButtonProps) => {
  const pxValue = paddingX || defaultPaddingX[variant];
  const pyValue = paddingY || defaultPaddingY[variant];

  return (
    <button
      type={type}
      className={`inline-block ${pxValue} ${pyValue} ${
        variant === "outline" && `${borderColor} ${textColor}`
      } font-bold text-center uppercase align-middle transition-all rounded-lg cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 active:opacity-85 tracking-tight-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:scale-102 ${focusRingColor} ${
        variants[variant]
      } ${backgroundColor} ${className}`}
      {...props}
    >
      {icon ? (
        <>
          <FontAwesomeIcon icon={icon} /> &nbsp;{btnText}
        </>
      ) : (
        btnText
      )}
    </button>
  );
};
