import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TemplateCard } from "@/components/TemplateCard";
import { EditorPanel } from "@/components/EditorPanel";
import { FlierPreview } from "@/components/FlierPreview";
import { UserNav } from "@/components/UserNav";
import { Sparkles, Zap, Target, Search, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTemplates } from "@/hooks/useTemplates";
import { useDesignSave } from "@/hooks/useDesignSave";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-image.jpg";


const Index = () => {
  const { user, loading } = useAuth();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const saveDesign = useDesignSave();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [flierText, setFlierText] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [designTitle, setDesignTitle] = useState("");

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const generateText = async () => {
    if (!businessType.trim()) {
      toast({
        title: "Please enter business type",
        description: "We need to know your business type to generate relevant text.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedTemplateData = templates?.find(t => t.id === selectedTemplate);
      const { data, error } = await supabase.functions.invoke('generate-ai-text', {
        body: {
          businessType,
          templateType: selectedTemplateData?.category || 'general',
          targetAudience: 'general customers'
        }
      });

      if (error) throw error;

      setFlierText(data.generatedText);
      toast({
        title: "AI Text Generated!",
        description: "AI has created compelling copy for your flier.",
      });
    } catch (error: any) {
      // Fallback to local generation if API fails
      const defaultText = `🌟 ${businessType.toUpperCase()} 🌟\nQuality service you can trust\n📍 Visit us today\n📞 Call for more information`;
      setFlierText(defaultText);
      
      toast({
        title: "Text Generated!",
        description: "Created basic copy for your flier.",
      });
    }
  };

  const downloadFlier = async () => {
    if (user && selectedTemplate && flierText.trim()) {
      try {
        await saveDesign.mutateAsync({
          template_id: selectedTemplate,
          title: designTitle || `${businessType} Flier`,
          content: {
            text: flierText,
            customizations: {
              businessType,
              selectedTemplate,
            }
          }
        });
      } catch (error) {
        // Continue with download even if save fails
      }
    }

    toast({
      title: "Download Ready!",
      description: "Your flier will be downloaded as an image file.",
    });
  };

  if (loading || templatesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative bg-gradient-hero text-white">
          <div className="container mx-auto px-6 py-16">
            <div className="flex justify-between items-center mb-8">
              <div></div>
              <div className="flex items-center gap-4">
                {user ? (
                  <UserNav />
                ) : (
                  <Link to="/auth">
                    <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="text-center animate-fade-in">
              <h1 className="text-5xl font-bold mb-6">
                FlierCraft
                <span className="block text-2xl font-normal mt-2 opacity-90">
                  AI-Powered Poster Maker
                </span>
              </h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Create stunning promotional fliers in minutes. Perfect for hustlers, small businesses, and entrepreneurs who need professional designs fast.
              </p>
              <div className="flex justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4" />
                  AI-Generated Text
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4" />
                  Instant Download
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  Business-Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Editor */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Choose Template</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  id={template.id}
                  name={template.name}
                  category={template.category}
                  preview={template.description || template.name}
                  isSelected={selectedTemplate === template.id}
                  onClick={setSelectedTemplate}
                />
              ))}
            </div>
          </div>

          {/* Editor Panel */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Customize</h2>
            <EditorPanel
              selectedTemplate={selectedTemplate}
              flierText={flierText}
              setFlierText={setFlierText}
              businessType={businessType}
              setBusinessType={setBusinessType}
              onGenerateText={generateText}
              onDownload={downloadFlier}
            />
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Preview</h2>
            <div className="sticky top-6">
              <FlierPreview
                templateId={selectedTemplate}
                text={flierText}
                className="animate-scale-in"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Footer */}
      <section className="bg-gradient-secondary py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card className="animate-fade-in">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Pay per Design</h3>
                <div className="text-3xl font-bold text-primary mb-4">KES 75</div>
                <p className="text-muted-foreground">Perfect for occasional use</p>
              </CardContent>
            </Card>
            <Card className="animate-fade-in border-primary">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Monthly Unlimited</h3>
                <div className="text-3xl font-bold text-primary mb-4">KES 500</div>
                <p className="text-muted-foreground">Best for regular users</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
