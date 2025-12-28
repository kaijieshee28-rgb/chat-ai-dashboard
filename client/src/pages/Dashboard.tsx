import { useTiles, useDeleteTile } from "@/hooks/use-tiles";
import { AddTileDialog } from "@/components/AddTileDialog";
import { TileCard } from "@/components/TileCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: tiles, isLoading, isError } = useTiles();
  const deleteTile = useDeleteTile();
  const [search, setSearch] = useState("");

  const filteredTiles = tiles?.filter(tile => 
    tile.title.toLowerCase().includes(search.toLowerCase()) || 
    tile.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">My Dashboard</h2>
          <p className="text-muted-foreground">Access your favorite tools and resources.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search shortcuts..." 
              className="pl-10 rounded-xl bg-background border-border/60 focus:bg-card transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <AddTileDialog />
        </div>
      </div>

      {/* Grid Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-3xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-destructive font-semibold mb-2">Failed to load tiles</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page.</p>
          </div>
        ) : filteredTiles?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/50 rounded-3xl bg-card/30">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No shortcuts found</h3>
            <p className="text-muted-foreground max-w-sm">
              {search ? "Try searching for something else." : "Get started by adding your first shortcut tile."}
            </p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredTiles?.map((tile) => (
              <TileCard 
                key={tile.id} 
                tile={tile} 
                onDelete={(id) => deleteTile.mutate(id)} 
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
