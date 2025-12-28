import { Tile } from "@shared/schema";
import * as Icons from "lucide-react";
import { Trash2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TileCardProps {
  tile: Tile;
  onDelete: (id: number) => void;
}

export function TileCard({ tile, onDelete }: TileCardProps) {
  // Dynamically get icon component
  const IconComponent = (Icons as any)[tile.icon] || Icons.Link;
  const [isHovered, setIsHovered] = useState(false);

  // Map color names/hex to tailwind classes if possible or use style
  const isHex = tile.color.startsWith("#");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <a
        href={tile.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        <div className={cn(
          "h-full p-6 rounded-3xl transition-all duration-300 border border-transparent hover:border-border/50",
          "bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5",
          "flex flex-col justify-between aspect-[4/3] relative overflow-hidden"
        )}>
          {/* Background gradient splash */}
          <div 
            className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150"
            style={{ backgroundColor: tile.color }}
          />

          <div className="flex justify-between items-start z-10">
            <div 
              className="p-3.5 rounded-2xl shadow-sm transition-transform duration-300 group-hover:rotate-6"
              style={{ backgroundColor: `${tile.color}20`, color: tile.color }}
            >
              <IconComponent className="w-7 h-7" />
            </div>
            
            <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-2 group-hover:translate-y-0" />
          </div>

          <div className="z-10 mt-auto">
            <h3 className="text-lg font-bold font-display text-foreground group-hover:text-primary transition-colors">
              {tile.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 truncate font-medium opacity-70 group-hover:opacity-100 transition-opacity">
              {new URL(tile.url).hostname}
            </p>
          </div>
        </div>
      </a>

      {/* Delete Button - Only visible on hover */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(tile.id);
        }}
        className={cn(
          "absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 backdrop-blur-md shadow-lg border border-border/50 text-destructive opacity-0 scale-90 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground",
          isHovered && "opacity-100 scale-100"
        )}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
