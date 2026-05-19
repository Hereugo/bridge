import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id?: string;
          className?: string;
          "agent-id"?: string;
          variant?: string;
          "action-text"?: string;
          "start-call-text"?: string;
          "end-call-text"?: string;
          "listening-text"?: string;
          "speaking-text"?: string;
          "avatar-orb-color-1"?: string;
          "avatar-orb-color-2"?: string;
        },
        HTMLElement
      >;
    }
  }
}
