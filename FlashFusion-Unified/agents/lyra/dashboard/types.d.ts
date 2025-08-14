// Type declarations for modules without built-in types

declare module "mermaid" {
  interface MermaidAPI {
    initialize: (config: any) => void;
    contentLoaded: () => void;
  }

  const mermaid: MermaidAPI;
  export default mermaid;
}

declare module "lucide-react" {
  import { FC, SVGProps } from "react";

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }

  export type Icon = FC<IconProps>;

  export const Download: Icon;
  export const Maximize2: Icon;
  export const RefreshCw: Icon;
  // Add other icons as needed
}
