import { Badge } from "@/components/ui/badge";

export function RarityBadge({ name, color }: { name: string; color: string }) {
  return (
    <Badge color={color} aria-label={`Rarity: ${name}`}>
      <span aria-hidden="true" className="inline-block size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </Badge>
  );
}
