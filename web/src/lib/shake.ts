// Galat fields ko halka sa hilao — har submit pe dobara chale, isliye CSS class ki jagah Web Animations API
import { haptic } from "./native";

export function shakeFields(names: string[]) {
  if (names.length) haptic("error");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const name of names) {
    document.querySelector(`[data-field="${name}"]`)?.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(5px)" },
        { transform: "translateX(-3px)" },
        { transform: "translateX(2px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 380, easing: "ease-out" },
    );
  }
}

export const SUCCESS_REDIRECT_MS = 1300;
