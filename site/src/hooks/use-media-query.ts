import { useEffect, useState } from "react";

export const useMediaQuery = (query: string, initial = false) => {
  const [matches, setMatches] = useState(() => (typeof window === "undefined" ? initial : window.matchMedia(query).matches));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
};
