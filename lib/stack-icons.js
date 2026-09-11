/**
 * Brand marks for the toolkit keyboard, from Simple Icons.
 *
 * Named imports so the bundle carries only these 24 paths, not the whole set.
 * The three tools without an entry in Simple Icons (XGBoost, Stable-Baselines3,
 * Matplotlib) are simply absent here and their caps carry the name
 * alone — better than inventing a logo for a project that has none.
 *
 * Java maps to the OpenJDK mark, since the Java trademark logo is not in the
 * set; SQL, being a language rather than a product, borrows PostgreSQL's
 * elephant as the most recognisable "database" glyph.
 */
import {
  siCplusplus,
  siDart,
  siDocker,
  siElastic,
  siFastapi,
  siFlutter,
  siGit,
  siKalilinux,
  siNextdotjs,
  siOpencv,
  siOpenjdk,
  siPlotly,
  siPostgresql,
  siPostman,
  siPython,
  siPytorch,
  siRailway,
  siReact,
  siSupabase,
  siTypescript,
  siUbuntu,
  siVercel,
  siVirtualbox,
  siWireshark,
} from "simple-icons";

const ICONS = {
  Python: siPython,
  Java: siOpenjdk,
  "C++": siCplusplus,
  TypeScript: siTypescript,
  Dart: siDart,
  SQL: siPostgresql,
  React: siReact,
  "Next.js": siNextdotjs,
  Flutter: siFlutter,
  PyTorch: siPytorch,
  FastAPI: siFastapi,
  OpenCV: siOpencv,
  Git: siGit,
  Postman: siPostman,
  Wireshark: siWireshark,
  "ELK Stack": siElastic,
  Docker: siDocker,
  Plotly: siPlotly,
  Ubuntu: siUbuntu,
  "Kali Linux": siKalilinux,
  VirtualBox: siVirtualbox,
  Supabase: siSupabase,
  Railway: siRailway,
  Vercel: siVercel,
};

/** The SVG path for a tool's mark, or null when it has none. */
export function iconPathFor(name) {
  return ICONS[name]?.path ?? null;
}
