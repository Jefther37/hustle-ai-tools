import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FlierPreviewProps {
  templateId: string | null;
  text: string;
  className?: string;
}

export const FlierPreview = ({ templateId, text, className }: FlierPreviewProps) => {
  const getTemplateStyle = (id: string | null) => {
    switch (id) {
      case "sale":
        return "bg-gradient-primary text-white";
      case "event":
        return "bg-gradient-secondary text-creative-blue";
      case "service":
        return "bg-creative-blue text-white";
      case "promo":
        return "bg-creative-teal text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div 
        className={cn(
          "aspect-[3/4] p-6 flex flex-col justify-center items-center text-center transition-all duration-300",
          getTemplateStyle(templateId)
        )}
      >
        {templateId ? (
          <div className="space-y-4">
            <div className="text-xs opacity-75 uppercase tracking-wide">
              {templateId === "sale" && "SPECIAL OFFER"}
              {templateId === "event" && "EVENT ANNOUNCEMENT"}
              {templateId === "service" && "PROFESSIONAL SERVICE"}
              {templateId === "promo" && "LIMITED TIME"}
            </div>
            <div className="font-bold text-lg leading-tight">
              {text || "Your text will appear here..."}
            </div>
            <div className="text-xs opacity-75">
              Contact us for more details
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-4">📄</div>
            <p>Select a template to preview your flier</p>
          </div>
        )}
      </div>
    </Card>
  );
};