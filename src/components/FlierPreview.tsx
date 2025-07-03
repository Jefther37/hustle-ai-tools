import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTemplates } from "@/hooks/useTemplates";

interface FlierPreviewProps {
  templateId: string | null;
  text: string;
  className?: string;
}

export const FlierPreview = ({ templateId, text, className }: FlierPreviewProps) => {
  const { data: templates } = useTemplates();
  
  const selectedTemplate = templates?.find(t => t.id === templateId);
  
  const getTemplateStyle = (template: any) => {
    if (!template?.background_config) {
      return "bg-muted text-muted-foreground";
    }

    const { background_config, color_scheme } = template;
    
    if (background_config.type === "gradient" && background_config.colors) {
      return `text-white`;
    } else if (background_config.type === "solid" && background_config.color) {
      return `text-white`;
    }
    
    return "bg-muted text-muted-foreground";
  };

  const getBackgroundStyle = (template: any) => {
    if (!template?.background_config) return {};

    const { background_config } = template;
    
    if (background_config.type === "gradient" && background_config.colors) {
      return {
        background: `linear-gradient(135deg, ${background_config.colors.join(", ")})`
      };
    } else if (background_config.type === "solid" && background_config.color) {
      return {
        backgroundColor: background_config.color
      };
    }
    
    return {};
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div 
        className={cn(
          "aspect-[3/4] p-6 flex flex-col justify-center items-center text-center transition-all duration-300",
          getTemplateStyle(selectedTemplate)
        )}
        style={getBackgroundStyle(selectedTemplate)}
      >
        {templateId && selectedTemplate ? (
          <div className="space-y-4">
            <div className="text-xs opacity-75 uppercase tracking-wide">
              {selectedTemplate.category.toUpperCase()}
            </div>
            <div className="font-bold text-lg leading-tight whitespace-pre-line">
              {text || "Your text will appear here..."}
            </div>
            <div className="text-xs opacity-75">
              {selectedTemplate.description || "Contact us for more details"}
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