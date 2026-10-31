import { type SVGProps } from "react";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  /** Width of the 24-unit icon box in px. */
  size?: number;
  /** Any CSS colour. Defaults to the surrounding text colour. */
  color?: string;
  strokeWidth?: number;
}

/** Github (outline). */
export function GithubIcon({ size = 24, color = "currentColor", strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      color={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 21.5V18.3C15 17.4 14.7 16.7 14.2 16.2C17 15.9 20 14.8 20 10C20 8.7 19.5 7.6 18.8 6.7C18.9 6.4 19.3 5.1 18.7 3.4C18.7 3.4 17.7 3.1 15.4 4.6A11.3 11.3 0 0 0 9.4 4.6C7.1 3.1 6.1 3.4 6.1 3.4C5.5 5.1 5.9 6.4 6 6.7C5.2 7.6 4.8 8.7 4.8 10C4.8 14.8 7.7 15.9 10.6 16.2C10.2 16.6 9.9 17.2 9.8 18V21.5"/>
      <path d="M9.8 19.2C6.6 20.2 6.2 17.6 4.5 17.2"/>
    </svg>
  );
}
