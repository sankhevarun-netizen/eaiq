import {
  Banknote, Boxes, Building, Building2, Cog, Construction, Cpu, Factory, Landmark, Layers,
  MonitorSmartphone, Network, Server, Siren, Zap, type LucideIcon, Circle,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Banknote, Boxes, Building, Building2, Cog, Construction, Cpu, Factory, Landmark, Layers,
  MonitorSmartphone, Network, Server, Siren, Zap,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = MAP[name] ?? Circle;
  return <C className={className} />;
}
