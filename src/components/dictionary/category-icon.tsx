import { createElement } from "react";
import {
  PawPrint,
  UtensilsCrossed,
  Users,
  Leaf,
  PersonStanding,
  Car,
  Package,
  Sun,
  Shapes,
  type LucideProps,
} from "lucide-react";

const ICONS_BY_SLUG: Record<string, React.ComponentType<LucideProps>> = {
  animals: PawPrint,
  food: UtensilsCrossed,
  family: Users,
  nature: Leaf,
  body: PersonStanding,
  transportation: Car,
  objects: Package,
  "daily-life": Sun,
};

/**
 * Renders the icon for a dictionary category slug. A component (not a
 * function returning a component reference) so the icon lookup happens
 * inside a properly declared component instead of a capitalized local
 * variable computed during a caller's render.
 */
export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const icon = ICONS_BY_SLUG[slug] ?? Shapes;
  return createElement(icon, { className });
}
