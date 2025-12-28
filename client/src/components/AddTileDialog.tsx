import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTileSchema, type InsertTile } from "@shared/schema";
import { useCreateTile } from "@/hooks/use-tiles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import * as Icons from "lucide-react";

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
];

const PRESET_ICONS = [
  "LayoutDashboard", "Globe", "Mail", "MessageSquare", "Music", "Video",
  "Image", "FileText", "Folder", "Github", "Twitter", "Linkedin", "Slack",
  "Figma", "Code", "Terminal", "Database", "Server", "Cloud", "Settings"
];

export function AddTileDialog() {
  const [open, setOpen] = useState(false);
  const createTile = useCreateTile();
  
  const form = useForm<InsertTile>({
    resolver: zodResolver(insertTileSchema),
    defaultValues: {
      title: "",
      url: "",
      icon: "Link",
      color: "#3b82f6",
    },
  });

  function onSubmit(data: InsertTile) {
    createTile.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="rounded-xl h-12 px-6 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-none shadow-2xl bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-display font-bold">New Widget</DialogTitle>
          <DialogDescription>
            Add a new shortcut tile to your dashboard.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Site" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <div className="grid grid-cols-5 gap-2 mt-2 max-h-[160px] overflow-y-auto p-1">
                    {PRESET_ICONS.map((iconName) => {
                      const Icon = (Icons as any)[iconName];
                      return (
                        <div
                          key={iconName}
                          onClick={() => field.onChange(iconName)}
                          className={`
                            p-2 rounded-lg flex items-center justify-center cursor-pointer transition-all
                            ${field.value === iconName 
                              ? "bg-primary text-primary-foreground shadow-md scale-105" 
                              : "bg-muted text-muted-foreground hover:bg-muted/80"}
                          `}
                        >
                          {Icon && <Icon className="w-5 h-5" />}
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent Color</FormLabel>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <div
                        key={color}
                        onClick={() => field.onChange(color)}
                        className={`
                          w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110
                          ${field.value === color ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}
                        `}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full rounded-xl py-6 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              disabled={createTile.isPending}
            >
              {createTile.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Widget"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
