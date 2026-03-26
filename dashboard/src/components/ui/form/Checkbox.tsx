import { FocusRingColor } from "@/types";

interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    FocusRingColor {
  marginTop?: string;
  focusRingOffsetColor?: string;
}

export const Checkbox = ({
  marginTop = "0.54",
  focusRingColor = "focus-visible:ring-primary-ring/50",
  focusRingOffsetColor,
  ...props
}: CheckboxProps) => (
  <input
    type="checkbox"
    className={`mt-${marginTop} peer appearance-none cursor-pointer transition-all duration-250 ease-soft-in-out w-10 h-5 rounded-10 bg-secondary/10 relative border border-gray-200 border-solid bg-none bg-contain bg-left ml-auto bg-no-repeat align-top after:content-[''] after:absolute after:top-px after:left-px after:bg-surface after:rounded-circle after:shadow-soft-2xl after:duration-250 after:h-4 after:w-4 checked:bg-secondary/95 checked:border-secondary/95 checked:after:translate-x-[20px] shrink-0 focus-visible:outline-none focus-visible:ring-2 ${focusRingColor} focus-visible:ring-offset-2 ${focusRingOffsetColor} focus-visible:scale-105`}
    {...props}
  />
);
