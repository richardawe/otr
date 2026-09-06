import type { Kind } from "../types";

export function Marker({ kind }: { kind: Kind }) {
  return <span className={`marker marker-${kind}`} aria-hidden="true" />;
}
