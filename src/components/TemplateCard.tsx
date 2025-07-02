import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  id: string;
  name: string;
  category: string;
  preview: string;
  isSelected?: boolean;
  onClick: (id: string) => void;
}

export const TemplateCard = ({ 
  id, 
  name, 
  category, 
  preview, 
  isSelected, 
  onClick 
}: TemplateCardProps) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-creative hover:scale-105 animate-fade-in",
        isSelected && "ring-2 ring-primary shadow-creative"
      )}
      onClick={() => onClick(id)}
    >
      <CardContent className="p-0">
        <div className="aspect-[3/4] bg-gradient-secondary rounded-t-lg flex items-center justify-center text-muted-foreground">
          {preview}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm">{name}</h3>
          <p className="text-xs text-muted-foreground">{category}</p>
        </div>
      </CardContent>
    </Card>
  );
};