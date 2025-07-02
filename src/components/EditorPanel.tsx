import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Type, Palette, Download } from "lucide-react";

interface EditorPanelProps {
  selectedTemplate: string | null;
  flierText: string;
  setFlierText: (text: string) => void;
  businessType: string;
  setBusinessType: (type: string) => void;
  onGenerateText: () => void;
  onDownload: () => void;
}

export const EditorPanel = ({
  selectedTemplate,
  flierText,
  setFlierText,
  businessType,
  setBusinessType,
  onGenerateText,
  onDownload
}: EditorPanelProps) => {
  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a template to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Text Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="business-type">Business Type</Label>
            <Input
              id="business-type"
              placeholder="e.g. Hair Salon, Electronics Shop"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
          </div>
          <Button 
            onClick={onGenerateText}
            variant="gradient"
            className="w-full"
            disabled={!businessType.trim()}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Text
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Edit Text
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Your flier text will appear here..."
            value={flierText}
            onChange={(e) => setFlierText(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Design Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            More design options coming soon!
          </p>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded bg-creative-blue cursor-pointer border-2 border-transparent hover:border-primary" />
            <div className="w-8 h-8 rounded bg-creative-green cursor-pointer border-2 border-transparent hover:border-primary" />
            <div className="w-8 h-8 rounded bg-creative-teal cursor-pointer border-2 border-transparent hover:border-primary" />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={onDownload}
        variant="creative"
        size="lg"
        className="w-full"
        disabled={!flierText.trim()}
      >
        <Download className="h-4 w-4 mr-2" />
        Download Flier
      </Button>
    </div>
  );
};