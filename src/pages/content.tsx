import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Loader2,
  RefreshCw,
  Edit,
  Plus,
  Save,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  landingPageContentApi,
  type LandingPageContentResponse,
  type LandingPageContentRequest,
} from "@/lib/backendLandingPageContentApi";
import { BACKEND_BASE_URL } from "@/lib/constants";

interface HeroContentFields {
  title: string;
  tagline: string;
  description: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
}

interface PackageCard {
  name: string;
  price: string;
  buttonText?: string;
}

interface HowItWorksStep {
  id: number;
  title: string;
  emoji: string;
  elements: Array<{
    type: string;
    content?: string;
    packages?: PackageCard[];
  }>;
}

interface HowItWorksFields {
  title: string;
  steps: HowItWorksStep[];
  colors: {
    background: string;
    backgroundGradient: string;
    primary: string;
    secondary: string;
    accent: string;
    textGlow: string;
  };
  timing: {
    stepDuration: number;
    transitionDuration: number;
  };
  text: {
    titleSize: string;
    stepSize: string;
  };
}

interface PickYourFocusCategory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface PickYourFocusFields {
  header: string;
  subtitle: string;
  categories: PickYourFocusCategory[];
}

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface FeaturesFields {
  items: FeatureItem[];
}

interface AudienceCard {
  id: string;
  heading: string;
  subheading: string;
  checklistItems: string[];
  ctaText: string;
}

interface AudienceCardsFields {
  cards: AudienceCard[];
}

interface KeyDifferenceFeature {
  text: string;
  subItems?: string[];
}

interface KeyDifferencesFields {
  title: string;
  features: KeyDifferenceFeature[];
}

interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  description?: string;
  priceDisplay: string;
  currency?: string;
  hasThemeStudio?: boolean;
  features: string[];
  setupFee: {
    label: string;
    amount: string;
    period: string;
  };
  subscription: {
    label: string;
    amount: string;
    note: string;
  };
  button: string;
}

interface PricingFields {
  title: string;
  subtitle: string;
  plans: PricingPlan[];
}

interface FooterNavigationLink {
  label: string;
  href: string;
}

interface FooterSocialLink {
  name: string;
  href: string;
  icon: string;
}

interface FooterFields {
  newsletter: {
    title: string;
    description: string;
    emailPlaceholder: string;
    buttonText: string;
  };
  navigation: FooterNavigationLink[];
  social: FooterSocialLink[];
  copyright: string;
}

interface ThemeSettingsFields {
  selectedTheme: string;
}

interface HeaderLogoFields {
  showLogo: boolean;
  showBrandName: boolean;
  order: "logo-first" | "brand-first";
  brandName: string;
  brandNameFontSize: string;
  logoImageSize: string;
  logoImageUrl: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQFields {
  title: string;
  subtitle: string;
  items: FAQItem[];
}

import { CURRENCY } from "@/lib/currency";

export default function ContentPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<LandingPageContentResponse | null>(null);
  const [contentForm, setContentForm] = useState<LandingPageContentRequest>({
    section_key: "",
    content: {},
  });
  const [heroFields, setHeroFields] = useState<HeroContentFields>({
    title: "",
    tagline: "",
    description: "",
    primaryCtaLabel: "",
    secondaryCtaLabel: "",
  });
  const [howItWorksFields, setHowItWorksFields] = useState<HowItWorksFields>({
    title: "How it works",
    steps: [],
    colors: {
      background: "transparent",
      backgroundGradient: "transparent",
      primary: "rgb(var(--color1))",
      secondary: "rgb(var(--color2))",
      accent: "rgb(var(--color2))",
      textGlow: "rgba(var(--color1), 0.6)",
    },
    timing: {
      stepDuration: 4000,
      transitionDuration: 800,
    },
    text: {
      titleSize: "4rem",
      stepSize: "2rem",
    },
  });
  const [pickYourFocusFields, setPickYourFocusFields] = useState<PickYourFocusFields>({
    header: "Pick Your Focus",
    subtitle: "Sportsbook, Casino, Sweepstakes, or Lotteryâ€”choose your model.",
    categories: [],
  });
  const [featuresFields, setFeaturesFields] = useState<FeaturesFields>({
    items: [],
  });
  const [audienceCardsFields, setAudienceCardsFields] = useState<AudienceCardsFields>({
    cards: [],
  });
  const [keyDifferencesFields, setKeyDifferencesFields] = useState<KeyDifferencesFields>({
    title: "Key Differences",
    features: [],
  });
  const [pricingFields, setPricingFields] = useState<PricingFields>({
    title: "Pricing",
    subtitle: "You pick the approach based on your confidence. We help you grow.",
    plans: [],
  });
  const [footerFields, setFooterFields] = useState<FooterFields>({
    newsletter: {
      title: "Build Your Casino Empire",
      description: "Get the latest casino builder updates, industry insights, and exclusive offers. Launch your iGaming platform in 30 minutes.",
      emailPlaceholder: "your@email.com",
      buttonText: "Get Started",
    },
    navigation: [],
    social: [],
    copyright: "Â© 2025 CSZGLOBAL. All rights reserved.",
  });
  const [themeSettingsFields, setThemeSettingsFields] = useState<ThemeSettingsFields>({
    selectedTheme: "maincard",
  });
  const [headerLogoFields, setHeaderLogoFields] = useState<HeaderLogoFields>({
    showLogo: true,
    showBrandName: true,
    order: "brand-first",
    brandName: "CSZGLOBAL",
    brandNameFontSize: "1.5rem",
    logoImageSize: "40px",
    logoImageUrl: "",
  });
  const [faqFields, setFaqFields] = useState<FAQFields>({
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about our platform",
    items: [],
  });
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});

  const {
    data: sectionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["landing-page-content"],
    queryFn: async () => {
      const response = await landingPageContentApi.getAllSections();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch content sections");
      }
      return response.data;
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: async (data: LandingPageContentRequest) => {
      const response = await landingPageContentApi.createSection(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create content section");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page-content"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Content section created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ sectionKey, data }: { sectionKey: string; data: LandingPageContentRequest }) => {
      const response = await landingPageContentApi.updateSection(sectionKey, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update content section");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page-content"] });
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Content section updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  const resetForm = () => {
    setContentForm({
      section_key: "",
      content: {},
    });
    setHeroFields({
      title: "",
      tagline: "",
      description: "",
      primaryCtaLabel: "",
      secondaryCtaLabel: "",
    });
    setHowItWorksFields({
      title: "How it works",
      steps: [],
      colors: {
        background: "transparent",
        backgroundGradient: "transparent",
        primary: "rgb(var(--color1))",
        secondary: "rgb(var(--color2))",
        accent: "rgb(var(--color2))",
        textGlow: "rgba(var(--color1), 0.6)",
      },
      timing: {
        stepDuration: 4000,
        transitionDuration: 800,
      },
      text: {
        titleSize: "4rem",
        stepSize: "2rem",
      },
    });
    setPickYourFocusFields({
      header: "Pick Your Focus",
      subtitle: "Sportsbook, Casino, Sweepstakes, or Lotteryâ€”choose your model.",
      categories: [],
    });
    setFeaturesFields({
      items: [],
    });
    setAudienceCardsFields({
      cards: [],
    });
    setKeyDifferencesFields({
      title: "Key Differences",
      features: [],
    });
    setPricingFields({
      title: "Pricing",
      subtitle: "You pick the approach based on your confidence. We help you grow.",
      plans: [],
    });
    setFooterFields({
      newsletter: {
        title: "Build Your Casino Empire",
        description: "Get the latest casino builder updates, industry insights, and exclusive offers. Launch your iGaming platform in 30 minutes.",
        emailPlaceholder: "your@email.com",
        buttonText: "Get Started",
      },
      navigation: [],
      social: [],
      copyright: "Â© 2025 CSZGLOBAL. All rights reserved.",
    });
    setThemeSettingsFields({
      selectedTheme: "maincard",
    });
    setHeaderLogoFields({
      showLogo: true,
      showBrandName: true,
      order: "brand-first",
      brandName: "CSZGLOBAL",
      brandNameFontSize: "1.5rem",
      logoImageSize: "40px",
      logoImageUrl: "",
    });
    setFaqFields({
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about our platform",
      items: [],
    });
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (section: LandingPageContentResponse) => {
    setEditingSection(section);
    setContentForm({
      section_key: section.section_key,
      content: section.content,
    });
    
    if (section.section_key === "hero") {
      const heroContent = section.content as HeroContentFields;
      setHeroFields({
        title: heroContent.title || "",
        tagline: heroContent.tagline || "",
        description: heroContent.description || "",
        primaryCtaLabel: heroContent.primaryCtaLabel || "",
        secondaryCtaLabel: heroContent.secondaryCtaLabel || "",
      });
    } else if (section.section_key === "how-it-works") {
      const howItWorksContent = section.content as HowItWorksFields;
      setHowItWorksFields({
        title: howItWorksContent.title || "How it works",
        steps: howItWorksContent.steps || [],
        colors: howItWorksContent.colors || {
          background: "transparent",
          backgroundGradient: "transparent",
          primary: "rgb(var(--color1))",
          secondary: "rgb(var(--color2))",
          accent: "rgb(var(--color2))",
          textGlow: "rgba(var(--color1), 0.6)",
        },
        timing: howItWorksContent.timing || {
          stepDuration: 4000,
          transitionDuration: 800,
        },
        text: howItWorksContent.text || {
          titleSize: "4rem",
          stepSize: "2rem",
        },
      });
    } else if (section.section_key === "pick-your-focus") {
      const pickYourFocusContent = section.content as PickYourFocusFields;
      setPickYourFocusFields({
        header: pickYourFocusContent.header || "Pick Your Focus",
        subtitle: pickYourFocusContent.subtitle || "Sportsbook, Casino, Sweepstakes, or Lotteryâ€”choose your model.",
        categories: pickYourFocusContent.categories || [],
      });
    } else if (section.section_key === "features") {
      const featuresContent = section.content as FeaturesFields;
      setFeaturesFields({
        items: featuresContent.items || [],
      });
    } else if (section.section_key === "audience-cards") {
      const audienceCardsContent = section.content as AudienceCardsFields;
      setAudienceCardsFields({
        cards: audienceCardsContent.cards || [],
      });
    } else if (section.section_key === "key-differences") {
      const keyDifferencesContent = section.content as KeyDifferencesFields;
      setKeyDifferencesFields({
        title: keyDifferencesContent.title || "Key Differences",
        features: keyDifferencesContent.features || [],
      });
    } else if (section.section_key === "pricing") {
      const pricingContent = section.content as PricingFields;
      setPricingFields({
        title: pricingContent.title || "Pricing",
        subtitle: pricingContent.subtitle || "You pick the approach based on your confidence. We help you grow.",
        plans: pricingContent.plans || [],
      });
    } else if (section.section_key === "footer") {
      const footerContent = section.content as FooterFields;
      setFooterFields({
        newsletter: footerContent.newsletter || {
          title: "Build Your Casino Empire",
          description: "Get the latest casino builder updates, industry insights, and exclusive offers. Launch your iGaming platform in 30 minutes.",
          emailPlaceholder: "your@email.com",
          buttonText: "Get Started",
        },
        navigation: footerContent.navigation || [],
        social: footerContent.social || [],
        copyright: footerContent.copyright || "Â© 2025 CSZGLOBAL. All rights reserved.",
      });
    } else if (section.section_key === "theme-settings") {
      const themeContent = section.content as ThemeSettingsFields;
      setThemeSettingsFields({
        selectedTheme: themeContent.selectedTheme || "maincard",
      });
    } else if (section.section_key === "header-logo") {
      const headerContent = section.content as HeaderLogoFields;
      setHeaderLogoFields({
        showLogo: headerContent.showLogo !== undefined ? headerContent.showLogo : true,
        showBrandName: headerContent.showBrandName !== undefined ? headerContent.showBrandName : true,
        order: headerContent.order || "brand-first",
        brandName: headerContent.brandName || "CSZGLOBAL",
        brandNameFontSize: headerContent.brandNameFontSize || "1.5rem",
        logoImageSize: headerContent.logoImageSize || "40px",
        logoImageUrl: headerContent.logoImageUrl || "",
      });
    } else if (section.section_key === "faq") {
      const faqContent = section.content as FAQFields;
      setFaqFields({
        title: faqContent.title || "Frequently Asked Questions",
        subtitle: faqContent.subtitle || "Everything you need to know about our platform",
        items: faqContent.items || [],
      });
    } else {
      setContentForm((prev) => ({
        ...prev,
        content: section.content,
      }));
    }
    setIsEditDialogOpen(true);
  };

  const buildContentFromFields = (sectionKey: string): Record<string, any> => {
    if (sectionKey === "hero") {
      return {
        title: heroFields.title,
        tagline: heroFields.tagline,
        description: heroFields.description,
        primaryCtaLabel: heroFields.primaryCtaLabel,
        secondaryCtaLabel: heroFields.secondaryCtaLabel,
      };
    }
    if (sectionKey === "how-it-works") {
      return {
        title: howItWorksFields.title,
        steps: howItWorksFields.steps,
        colors: howItWorksFields.colors,
        timing: howItWorksFields.timing,
        text: howItWorksFields.text,
      };
    }
    if (sectionKey === "pick-your-focus") {
      return {
        header: pickYourFocusFields.header,
        subtitle: pickYourFocusFields.subtitle,
        categories: pickYourFocusFields.categories,
      };
    }
    if (sectionKey === "features") {
      return {
        items: featuresFields.items,
      };
    }
    if (sectionKey === "audience-cards") {
      return {
        cards: audienceCardsFields.cards,
      };
    }
    if (sectionKey === "key-differences") {
      return {
        title: keyDifferencesFields.title,
        features: keyDifferencesFields.features,
      };
    }
    if (sectionKey === "pricing") {
      return {
        title: pricingFields.title,
        subtitle: pricingFields.subtitle,
        plans: pricingFields.plans,
      };
    }
    if (sectionKey === "footer") {
      return {
        newsletter: footerFields.newsletter,
        navigation: footerFields.navigation,
        social: footerFields.social,
        copyright: footerFields.copyright,
      };
    }
    if (sectionKey === "theme-settings") {
      return {
        selectedTheme: themeSettingsFields.selectedTheme,
      };
    }
    if (sectionKey === "header-logo") {
      return {
        showLogo: headerLogoFields.showLogo,
        showBrandName: headerLogoFields.showBrandName,
        order: headerLogoFields.order,
        brandName: headerLogoFields.brandName,
        brandNameFontSize: headerLogoFields.brandNameFontSize,
        logoImageSize: headerLogoFields.logoImageSize,
        logoImageUrl: headerLogoFields.logoImageUrl,
      };
    }
    if (sectionKey === "faq") {
      return {
        title: faqFields.title,
        subtitle: faqFields.subtitle,
        items: faqFields.items,
      };
    }
    return contentForm.content || {};
  };

  const handleCreateSection = () => {
    if (!contentForm.section_key.trim()) {
      toast({
        title: "Validation Error",
        description: "Section key is required",
        variant: "destructive",
      });
      return;
    }

    if (contentForm.section_key === "hero") {
      if (!heroFields.title.trim() || !heroFields.tagline.trim() || !heroFields.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Title, tagline, and description are required",
          variant: "destructive",
        });
        return;
      }
    } else if (contentForm.section_key === "how-it-works") {
      if (!howItWorksFields.title.trim() || howItWorksFields.steps.length === 0) {
        toast({
          title: "Validation Error",
          description: "Title and at least one step are required",
          variant: "destructive",
        });
        return;
      }
    } else if (contentForm.section_key === "pick-your-focus") {
      if (!pickYourFocusFields.header.trim() || !pickYourFocusFields.subtitle.trim() || pickYourFocusFields.categories.length === 0) {
        toast({
          title: "Validation Error",
          description: "Header, subtitle, and at least one category are required",
          variant: "destructive",
        });
        return;
      }
    } else if (contentForm.section_key === "features") {
      if (featuresFields.items.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one feature item is required",
          variant: "destructive",
        });
        return;
      }
      for (const item of featuresFields.items) {
        if (!item.id.trim() || !item.title.trim() || !item.description.trim()) {
          toast({
            title: "Validation Error",
            description: "All feature items must have ID, title, and description",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (contentForm.section_key === "key-differences") {
      if (!keyDifferencesFields.title.trim() || keyDifferencesFields.features.length === 0) {
        toast({
          title: "Validation Error",
          description: "Title and at least one feature are required",
          variant: "destructive",
        });
        return;
      }
      for (const feature of keyDifferencesFields.features) {
        if (!feature.text.trim()) {
          toast({
            title: "Validation Error",
            description: "All features must have text",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (contentForm.section_key === "pricing") {
      if (!pricingFields.title.trim() || !pricingFields.subtitle.trim() || pricingFields.plans.length === 0) {
        toast({
          title: "Validation Error",
          description: "Title, subtitle, and at least one plan are required",
          variant: "destructive",
        });
        return;
      }
      for (const plan of pricingFields.plans) {
        if (!plan.id.trim() || !plan.name.trim() || !plan.priceDisplay.trim() || !plan.button.trim()) {
          toast({
            title: "Validation Error",
            description: "All plans must have an ID, name, price display, and button text",
            variant: "destructive",
          });
          return;
        }
        if (!plan.setupFee.label.trim() || !plan.setupFee.amount.trim()) {
          toast({
            title: "Validation Error",
            description: "All plans must have setup fee label and amount",
            variant: "destructive",
          });
          return;
        }
        if (!plan.subscription.label.trim() || !plan.subscription.amount.trim()) {
          toast({
            title: "Validation Error",
            description: "All plans must have subscription label and amount",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (contentForm.section_key === "footer") {
      if (!footerFields.newsletter.title.trim() || !footerFields.newsletter.description.trim() || !footerFields.copyright.trim()) {
        toast({
          title: "Validation Error",
          description: "Newsletter title, description, and copyright are required",
          variant: "destructive",
        });
        return;
      }
    } else if (contentForm.section_key === "theme-settings") {
      if (!themeSettingsFields.selectedTheme.trim()) {
        toast({
          title: "Validation Error",
          description: "Selected theme is required",
          variant: "destructive",
        });
        return;
      }
    } else if (contentForm.section_key === "header-logo") {
      if (!headerLogoFields.showLogo && !headerLogoFields.showBrandName) {
        toast({
          title: "Validation Error",
          description: "At least one of 'Show Logo' or 'Show Brand Name' must be enabled",
          variant: "destructive",
        });
        return;
      }
      if (headerLogoFields.showBrandName && !headerLogoFields.brandName.trim()) {
        toast({
          title: "Validation Error",
          description: "Brand name is required when 'Show Brand Name' is enabled",
          variant: "destructive",
        });
        return;
      }
      if (headerLogoFields.showLogo && !headerLogoFields.logoImageUrl.trim()) {
        toast({
          title: "Validation Error",
          description: "Please upload a logo image when 'Show Logo' is enabled",
          variant: "destructive",
        });
        return;
      }
    } else if (contentForm.section_key === "faq") {
      if (!faqFields.title.trim()) {
        toast({
          title: "Validation Error",
          description: "FAQ title is required",
          variant: "destructive",
        });
        return;
      }
      if (faqFields.items.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one FAQ item is required",
          variant: "destructive",
        });
        return;
      }
      for (const item of faqFields.items) {
        if (!item.question.trim() || !item.answer.trim()) {
          toast({
            title: "Validation Error",
            description: "All FAQ items must have both question and answer",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (contentForm.section_key === "audience-cards") {
      if (audienceCardsFields.cards.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one card is required",
          variant: "destructive",
        });
        return;
      }
      for (const card of audienceCardsFields.cards) {
        if (!card.id.trim() || !card.heading.trim() || !card.subheading.trim() || !card.ctaText.trim()) {
          toast({
            title: "Validation Error",
            description: "All cards must have ID, heading, subheading, and CTA text",
            variant: "destructive",
          });
          return;
        }
        if (card.checklistItems.length === 0) {
          toast({
            title: "Validation Error",
            description: "Each card must have at least one checklist item",
            variant: "destructive",
          });
          return;
        }
      }
    }

    const content = buildContentFromFields(contentForm.section_key);
    const data: LandingPageContentRequest = {
      section_key: contentForm.section_key,
      content: content,
    };
    createSectionMutation.mutate(data);
  };

  const handleUpdateSection = () => {
    if (!editingSection) return;

    if (editingSection.section_key === "hero") {
      if (!heroFields.title.trim() || !heroFields.tagline.trim() || !heroFields.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Title, tagline, and description are required",
          variant: "destructive",
        });
        return;
      }
    } else if (editingSection.section_key === "how-it-works") {
      if (!howItWorksFields.title.trim() || howItWorksFields.steps.length === 0) {
        toast({
          title: "Validation Error",
          description: "Title and at least one step are required",
          variant: "destructive",
        });
        return;
      }
    } else if (editingSection.section_key === "pick-your-focus") {
      if (!pickYourFocusFields.header.trim() || !pickYourFocusFields.subtitle.trim() || pickYourFocusFields.categories.length === 0) {
        toast({
          title: "Validation Error",
          description: "Header, subtitle, and at least one category are required",
          variant: "destructive",
        });
        return;
      }
    } else if (editingSection.section_key === "features") {
      if (featuresFields.items.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one feature item is required",
          variant: "destructive",
        });
        return;
      }
      for (const item of featuresFields.items) {
        if (!item.id.trim() || !item.title.trim() || !item.description.trim()) {
          toast({
            title: "Validation Error",
            description: "All feature items must have ID, title, and description",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (editingSection.section_key === "key-differences") {
      if (!keyDifferencesFields.title.trim() || keyDifferencesFields.features.length === 0) {
        toast({
          title: "Validation Error",
          description: "Title and at least one feature are required",
          variant: "destructive",
        });
        return;
      }
      for (const feature of keyDifferencesFields.features) {
        if (!feature.text.trim()) {
          toast({
            title: "Validation Error",
            description: "All features must have text",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (editingSection.section_key === "pricing") {
      if (!pricingFields.title.trim() || !pricingFields.subtitle.trim() || pricingFields.plans.length === 0) {
        toast({
          title: "Validation Error",
          description: "Title, subtitle, and at least one plan are required",
          variant: "destructive",
        });
        return;
      }
      for (const plan of pricingFields.plans) {
        if (!plan.id.trim() || !plan.name.trim() || !plan.priceDisplay.trim() || !plan.button.trim()) {
          toast({
            title: "Validation Error",
            description: "All plans must have an ID, name, price display, and button text",
            variant: "destructive",
          });
          return;
        }
        if (!plan.setupFee.label.trim() || !plan.setupFee.amount.trim()) {
          toast({
            title: "Validation Error",
            description: "All plans must have setup fee label and amount",
            variant: "destructive",
          });
          return;
        }
        if (!plan.subscription.label.trim() || !plan.subscription.amount.trim()) {
          toast({
            title: "Validation Error",
            description: "All plans must have subscription label and amount",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (editingSection.section_key === "footer") {
      if (!footerFields.newsletter.title.trim() || !footerFields.newsletter.description.trim() || !footerFields.copyright.trim()) {
        toast({
          title: "Validation Error",
          description: "Newsletter title, description, and copyright are required",
          variant: "destructive",
        });
        return;
      }
    } else if (editingSection.section_key === "theme-settings") {
      if (!themeSettingsFields.selectedTheme.trim()) {
        toast({
          title: "Validation Error",
          description: "Selected theme is required",
          variant: "destructive",
        });
        return;
      }
    } else if (editingSection.section_key === "header-logo") {
      if (!headerLogoFields.showLogo && !headerLogoFields.showBrandName) {
        toast({
          title: "Validation Error",
          description: "At least one of 'Show Logo' or 'Show Brand Name' must be enabled",
          variant: "destructive",
        });
        return;
      }
      if (headerLogoFields.showBrandName && !headerLogoFields.brandName.trim()) {
        toast({
          title: "Validation Error",
          description: "Brand name is required when 'Show Brand Name' is enabled",
          variant: "destructive",
        });
        return;
      }
      if (headerLogoFields.showLogo && !headerLogoFields.logoImageUrl.trim()) {
        toast({
          title: "Validation Error",
          description: "Please upload a logo image when 'Show Logo' is enabled",
          variant: "destructive",
        });
        return;
      }
    } else if (editingSection.section_key === "faq") {
      if (!faqFields.title.trim()) {
        toast({
          title: "Validation Error",
          description: "FAQ title is required",
          variant: "destructive",
        });
        return;
      }
      if (faqFields.items.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one FAQ item is required",
          variant: "destructive",
        });
        return;
      }
      for (const item of faqFields.items) {
        if (!item.question.trim() || !item.answer.trim()) {
          toast({
            title: "Validation Error",
            description: "All FAQ items must have both question and answer",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (editingSection.section_key === "audience-cards") {
      if (audienceCardsFields.cards.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one card is required",
          variant: "destructive",
        });
        return;
      }
      for (const card of audienceCardsFields.cards) {
        if (!card.id.trim() || !card.heading.trim() || !card.subheading.trim() || !card.ctaText.trim()) {
          toast({
            title: "Validation Error",
            description: "All cards must have ID, heading, subheading, and CTA text",
            variant: "destructive",
          });
          return;
        }
        if (card.checklistItems.length === 0) {
          toast({
            title: "Validation Error",
            description: "Each card must have at least one checklist item",
            variant: "destructive",
          });
          return;
        }
      }
    }

    const content = buildContentFromFields(editingSection.section_key);
    const data: LandingPageContentRequest = {
      section_key: editingSection.section_key,
      content: content,
    };
    updateSectionMutation.mutate({ sectionKey: editingSection.section_key, data });
  };


  const addStep = () => {
    const newStep: HowItWorksStep = {
      id: howItWorksFields.steps.length + 1,
      title: "",
      emoji: "",
      elements: [{ type: "globe" }],
    };
    setHowItWorksFields((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const removeStep = (index: number) => {
    setHowItWorksFields((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const updateStep = (index: number, field: keyof HowItWorksStep, value: any) => {
    setHowItWorksFields((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      ),
    }));
  };

  const updateStepElement = (stepIndex: number, elementIndex: number, field: string, value: any) => {
    setHowItWorksFields((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === stepIndex
          ? {
              ...step,
              elements: step.elements.map((el, j) =>
                j === elementIndex ? { ...el, [field]: value } : el
              ),
            }
          : step
      ),
    }));
  };

  const addCategory = () => {
    const newCategory: PickYourFocusCategory = {
      id: "",
      title: "",
      description: "",
      imageUrl: "",
    };
    setPickYourFocusFields((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
  };

  const removeCategory = (index: number) => {
    setPickYourFocusFields((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const updateCategory = (index: number, field: keyof PickYourFocusCategory, value: string) => {
    setPickYourFocusFields((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      ),
    }));
  };

  const addFeature = () => {
    const newFeature: FeatureItem = {
      id: "",
      title: "",
      description: "",
      imageUrl: "",
    };
    setFeaturesFields((prev) => ({
      ...prev,
      items: [...prev.items, newFeature],
    }));
  };

  const removeFeature = (index: number) => {
    setFeaturesFields((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    setFeaturesFields((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addAudienceCard = () => {
    const newCard: AudienceCard = {
      id: "",
      heading: "",
      subheading: "",
      checklistItems: [],
      ctaText: "",
    };
    setAudienceCardsFields((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
  };

  const removeAudienceCard = (index: number) => {
    setAudienceCardsFields((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }));
  };

  const updateAudienceCard = (index: number, field: keyof AudienceCard, value: string | string[]) => {
    setAudienceCardsFields((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      ),
    }));
  };

  const addChecklistItem = (cardIndex: number) => {
    setAudienceCardsFields((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === cardIndex
          ? { ...card, checklistItems: [...card.checklistItems, ""] }
          : card
      ),
    }));
  };

  const removeChecklistItem = (cardIndex: number, itemIndex: number) => {
    setAudienceCardsFields((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === cardIndex
          ? { ...card, checklistItems: card.checklistItems.filter((_, j) => j !== itemIndex) }
          : card
      ),
    }));
  };

  const updateChecklistItem = (cardIndex: number, itemIndex: number, value: string) => {
    setAudienceCardsFields((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === cardIndex
          ? {
              ...card,
              checklistItems: card.checklistItems.map((item, j) =>
                j === itemIndex ? value : item
              ),
            }
          : card
      ),
    }));
  };

  const addKeyDifferenceFeature = () => {
    const newFeature: KeyDifferenceFeature = {
      text: "",
      subItems: [],
    };
    setKeyDifferencesFields((prev) => ({
      ...prev,
      features: [...prev.features, newFeature],
    }));
  };

  const removeKeyDifferenceFeature = (index: number) => {
    setKeyDifferencesFields((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateKeyDifferenceFeature = (index: number, field: keyof KeyDifferenceFeature, value: string | string[]) => {
    setKeyDifferencesFields((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? { ...feature, [field]: value } : feature
      ),
    }));
  };

  const addKeyDifferenceSubItem = (featureIndex: number) => {
    setKeyDifferencesFields((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === featureIndex
          ? { ...feature, subItems: [...(feature.subItems || []), ""] }
          : feature
      ),
    }));
  };

  const removeKeyDifferenceSubItem = (featureIndex: number, subItemIndex: number) => {
    setKeyDifferencesFields((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === featureIndex
          ? { ...feature, subItems: feature.subItems?.filter((_, j) => j !== subItemIndex) || [] }
          : feature
      ),
    }));
  };

  const updateKeyDifferenceSubItem = (featureIndex: number, subItemIndex: number, value: string) => {
    setKeyDifferencesFields((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === featureIndex
          ? {
              ...feature,
              subItems: feature.subItems?.map((item, j) =>
                j === subItemIndex ? value : item
              ) || [],
            }
          : feature
      ),
    }));
  };

  const addPricingPlan = () => {
    const newPlan: PricingPlan = {
      id: "",
      name: "",
      badge: "",
      description: "",
      priceDisplay: "",
      currency: CURRENCY,
      hasThemeStudio: false,
      features: [],
      setupFee: {
        label: "One-time setup fee:",
        amount: "",
        period: "",
      },
      subscription: {
        label: "Monthly subscription:",
        amount: "",
        note: "",
      },
      button: "CHOOSE A PLAN",
    };
    setPricingFields((prev) => ({
      ...prev,
      plans: [...prev.plans, newPlan],
    }));
  };

  const removePricingPlan = (index: number) => {
    setPricingFields((prev) => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index),
    }));
  };

  const updatePricingPlan = (
    index: number,
    field: keyof PricingPlan,
    value: string | PricingPlan["setupFee"] | PricingPlan["subscription"] | boolean | string[]
  ) => {
    setPricingFields((prev) => ({
      ...prev,
      plans: prev.plans.map((plan, i) =>
        i === index ? { ...plan, [field]: value } : plan
      ),
    }));
  };

  const updatePricingPlanFeatures = (index: number, value: string) => {
    const features = value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    updatePricingPlan(index, "features", features);
  };

  const updatePricingPlanSetupFee = (index: number, field: keyof PricingPlan["setupFee"], value: string) => {
    setPricingFields((prev) => ({
      ...prev,
      plans: prev.plans.map((plan, i) =>
        i === index
          ? { ...plan, setupFee: { ...plan.setupFee, [field]: value } }
          : plan
      ),
    }));
  };

  const updatePricingPlanSubscription = (index: number, field: keyof PricingPlan["subscription"], value: string) => {
    setPricingFields((prev) => ({
      ...prev,
      plans: prev.plans.map((plan, i) =>
        i === index
          ? { ...plan, subscription: { ...plan.subscription, [field]: value } }
          : plan
      ),
    }));
  };

  const updateFooterNewsletter = (field: keyof FooterFields["newsletter"], value: string) => {
    setFooterFields((prev) => ({
      ...prev,
      newsletter: { ...prev.newsletter, [field]: value },
    }));
  };

  const addFooterNavigation = () => {
    const newLink: FooterNavigationLink = {
      label: "",
      href: "",
    };
    setFooterFields((prev) => ({
      ...prev,
      navigation: [...prev.navigation, newLink],
    }));
  };

  const removeFooterNavigation = (index: number) => {
    setFooterFields((prev) => ({
      ...prev,
      navigation: prev.navigation.filter((_, i) => i !== index),
    }));
  };

  const updateFooterNavigation = (index: number, field: keyof FooterNavigationLink, value: string) => {
    setFooterFields((prev) => ({
      ...prev,
      navigation: prev.navigation.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const addFooterSocial = () => {
    const newSocial: FooterSocialLink = {
      name: "",
      href: "#",
      icon: "linkedin",
    };
    setFooterFields((prev) => ({
      ...prev,
      social: [...prev.social, newSocial],
    }));
  };

  const removeFooterSocial = (index: number) => {
    setFooterFields((prev) => ({
      ...prev,
      social: prev.social.filter((_, i) => i !== index),
    }));
  };

  const updateFooterSocial = (index: number, field: keyof FooterSocialLink, value: string) => {
    setFooterFields((prev) => ({
      ...prev,
      social: prev.social.map((social, i) =>
        i === index ? { ...social, [field]: value } : social
      ),
    }));
  };

  const handleImageUpload = async (categoryIndex: number, file: File, sectionType?: "pick-your-focus" | "features") => {
    const uploadKey = sectionType === "features" ? `feature_${categoryIndex}` : `category_${categoryIndex}`;
    setUploadingImages((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const response = await landingPageContentApi.uploadImage(file);
      if (response.success && response.data) {
        if (sectionType === "features") {
          updateFeature(categoryIndex, "imageUrl", response.data.url);
        } else {
          updateCategory(categoryIndex, "imageUrl", response.data.url);
        }
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to upload image",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImages((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleHeaderLogoUpload = async (file: File) => {
    setUploadingImages((prev) => ({ ...prev, header_logo: true }));

    try {
      const response = await landingPageContentApi.uploadImage(file);
      if (response.success && response.data) {
        setHeaderLogoFields((prev) => ({ ...prev, logoImageUrl: response.data!.url }));
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: response.error || "Failed to upload image",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading the image",
        variant: "destructive",
      });
    } finally {
      setUploadingImages((prev) => ({ ...prev, header_logo: false }));
    }
  };

  const addFAQItem = () => {
    setFaqFields((prev) => ({
      ...prev,
      items: [...prev.items, { question: "", answer: "" }],
    }));
  };

  const removeFAQItem = (index: number) => {
    setFaqFields((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateFAQItem = (index: number, field: "question" | "answer", value: string) => {
    setFaqFields((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Landing Page Content</h1>
        <p className="text-muted-foreground mt-2">
          Manage content sections for the landing page
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Content Sections</CardTitle>
              <CardDescription>
                {sectionsData?.sections ? `${sectionsData.sections.length} sections` : "Loading sections..."}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Failed to load content sections. Please try again.
            </div>
          ) : !sectionsData?.sections || sectionsData.sections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No content sections found. Create one to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section Key</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectionsData.sections.map((section) => (
                    <TableRow key={section.section_key}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{section.section_key}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate text-sm text-muted-foreground">
                          {JSON.stringify(section.content).substring(0, 100)}
                          {JSON.stringify(section.content).length > 100 ? "..." : ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(section)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Content Section</DialogTitle>
            <DialogDescription>
              Create a new content section for the landing page
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section_key">Section Key</Label>
              <Input
                id="section_key"
                value={contentForm.section_key}
                onChange={(e) =>
                  setContentForm((prev) => ({ ...prev, section_key: e.target.value }))
                }
                placeholder="e.g., hero, features, pricing"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the section identifier (e.g., "hero" for hero section)
              </p>
            </div>

            {contentForm.section_key === "hero" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hero_title">Title *</Label>
                  <Input
                    id="hero_title"
                    value={heroFields.title}
                    onChange={(e) =>
                      setHeroFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., Launch your iGaming brand in 30 minutes"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_tagline">Tagline *</Label>
                  <Input
                    id="hero_tagline"
                    value={heroFields.tagline}
                    onChange={(e) =>
                      setHeroFields((prev) => ({ ...prev, tagline: e.target.value }))
                    }
                    placeholder="e.g., No Code. No maintenance fees. No Limits."
                  />
                </div>
                <div>
                  <Label htmlFor="hero_description">Description *</Label>
                  <Textarea
                    id="hero_description"
                    value={heroFields.description}
                    onChange={(e) =>
                      setHeroFields((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Enter a detailed description"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="hero_primary_cta">Primary CTA Label</Label>
                  <Input
                    id="hero_primary_cta"
                    value={heroFields.primaryCtaLabel}
                    onChange={(e) =>
                      setHeroFields((prev) => ({ ...prev, primaryCtaLabel: e.target.value }))
                    }
                    placeholder="e.g., START BUILDING"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_secondary_cta">Secondary CTA Label</Label>
                  <Input
                    id="hero_secondary_cta"
                    value={heroFields.secondaryCtaLabel}
                    onChange={(e) =>
                      setHeroFields((prev) => ({ ...prev, secondaryCtaLabel: e.target.value }))
                    }
                    placeholder="e.g., BOOK A DEMO"
                  />
                </div>
              </div>
            ) : contentForm.section_key === "how-it-works" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hiw_title">Title *</Label>
                  <Input
                    id="hiw_title"
                    value={howItWorksFields.title}
                    onChange={(e) =>
                      setHowItWorksFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., How it works"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Steps *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addStep}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Step
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4">
                    {howItWorksFields.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Step {stepIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(stepIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`step_title_${stepIndex}`}>Step Title</Label>
                            <Input
                              id={`step_title_${stepIndex}`}
                              value={step.title}
                              onChange={(e) => updateStep(stepIndex, "title", e.target.value)}
                              placeholder="e.g., Step 1: Choose Your Country ðŸŒ"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`step_emoji_${stepIndex}`}>Emoji</Label>
                            <Input
                              id={`step_emoji_${stepIndex}`}
                              value={step.emoji}
                              onChange={(e) => updateStep(stepIndex, "emoji", e.target.value)}
                              placeholder="e.g., ðŸŒ"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`step_element_type_${stepIndex}`}>Element Type</Label>
                            <Input
                              id={`step_element_type_${stepIndex}`}
                              value={step.elements[0]?.type || "globe"}
                              onChange={(e) =>
                                updateStepElement(stepIndex, 0, "type", e.target.value)
                              }
                              placeholder="e.g., globe, cards, input, crypto, dashboard, launch"
                            />
                          </div>

                          {step.elements[0]?.type === "cards" && (
                            <div className="mt-4 space-y-3 border-t pt-4">
                              <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                                Pricing cards for this step now use the global Pricing plans. Update the
                                plans from the Pricing section above to change what appears here.
                              </div>
                            </div>
                          )}

                          {step.elements[0]?.type === "input" && (
                            <div className="mt-4">
                              <Label htmlFor={`step_element_content_${stepIndex}`}>Input Content</Label>
                              <Input
                                id={`step_element_content_${stepIndex}`}
                                value={step.elements[0]?.content || ""}
                                onChange={(e) =>
                                  updateStepElement(stepIndex, 0, "content", e.target.value)
                                }
                                placeholder="e.g., LuckyDice.io"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {howItWorksFields.steps.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No steps added. Click "Add Step" to add one.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hiw_step_duration">Step Duration (ms)</Label>
                    <Input
                      id="hiw_step_duration"
                      type="number"
                      value={howItWorksFields.timing.stepDuration}
                      onChange={(e) =>
                        setHowItWorksFields((prev) => ({
                          ...prev,
                          timing: { ...prev.timing, stepDuration: parseInt(e.target.value) || 4000 },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="hiw_transition_duration">Transition Duration (ms)</Label>
                    <Input
                      id="hiw_transition_duration"
                      type="number"
                      value={howItWorksFields.timing.transitionDuration}
                      onChange={(e) =>
                        setHowItWorksFields((prev) => ({
                          ...prev,
                          timing: {
                            ...prev.timing,
                            transitionDuration: parseInt(e.target.value) || 800,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            ) : contentForm.section_key === "pick-your-focus" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pyf_header">Header *</Label>
                  <Input
                    id="pyf_header"
                    value={pickYourFocusFields.header}
                    onChange={(e) =>
                      setPickYourFocusFields((prev) => ({ ...prev, header: e.target.value }))
                    }
                    placeholder="e.g., Pick Your Focus"
                  />
                </div>
                <div>
                  <Label htmlFor="pyf_subtitle">Subtitle *</Label>
                  <Input
                    id="pyf_subtitle"
                    value={pickYourFocusFields.subtitle}
                    onChange={(e) =>
                      setPickYourFocusFields((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="e.g., Sportsbook, Casino, Sweepstakes, or Lotteryâ€”choose your model."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Categories *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCategory}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Category
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4">
                    {pickYourFocusFields.categories.map((category, catIndex) => (
                      <div key={catIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Category {catIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCategory(catIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`cat_id_${catIndex}`}>ID</Label>
                            <Input
                              id={`cat_id_${catIndex}`}
                              value={category.id}
                              onChange={(e) => updateCategory(catIndex, "id", e.target.value)}
                              placeholder="e.g., casino"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`cat_title_${catIndex}`}>Title</Label>
                            <Input
                              id={`cat_title_${catIndex}`}
                              value={category.title}
                              onChange={(e) => updateCategory(catIndex, "title", e.target.value)}
                              placeholder="e.g., Casino"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`cat_description_${catIndex}`}>Description</Label>
                            <Textarea
                              id={`cat_description_${catIndex}`}
                              value={category.description}
                              onChange={(e) => updateCategory(catIndex, "description", e.target.value)}
                              placeholder="e.g., Over 15'000 most popular games included"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`cat_image_${catIndex}`}>Image</Label>
                            <div className="space-y-2">
                              {category.imageUrl && (
                                <div className="relative w-32 h-32 border rounded overflow-hidden">
                                  <img
                                    src={category.imageUrl.startsWith("http") ? category.imageUrl : `${BACKEND_BASE_URL}${category.imageUrl}`}
                                    alt={category.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                              <Input
                                id={`cat_image_${catIndex}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(catIndex, file);
                                  }
                                }}
                                disabled={uploadingImages[`category_${catIndex}`]}
                              />
                              {uploadingImages[`category_${catIndex}`] && (
                                <p className="text-xs text-muted-foreground">Uploading...</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pickYourFocusFields.categories.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No categories added. Click "Add Category" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : contentForm.section_key ? (
              <div>
                <Label htmlFor="content_json">Content (JSON)</Label>
                <Textarea
                  id="content_json"
                  value={JSON.stringify(contentForm.content, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setContentForm((prev) => ({ ...prev, content: parsed }));
                    } catch {
                    }
                  }}
                  placeholder='{"key": "value"}'
                  className="font-mono text-sm min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter valid JSON content for this section
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 border rounded">
                Enter a section key to see the form fields
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleCreateSection}
              disabled={createSectionMutation.isPending}
            >
              {createSectionMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content Section</DialogTitle>
            <DialogDescription>
              Update the content for section: {editingSection?.section_key}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_section_key">Section Key</Label>
              <Input
                id="edit_section_key"
                value={editingSection?.section_key || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Section key cannot be changed
              </p>
            </div>

            {editingSection?.section_key === "hero" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_hero_title">Title *</Label>
                  <Input
                    id="edit_hero_title"
                    value={heroFields.title}
                    onChange={(e) =>
                      setHeroFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., Launch your iGaming brand in 30 minutes"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_hero_tagline">Tagline *</Label>
                  <Input
                    id="edit_hero_tagline"
                    value={heroFields.tagline}
                    onChange={(e) =>
                      setHeroFields((prev) => ({ ...prev, tagline: e.target.value }))
                    }
                    placeholder="e.g., No Code. No maintenance fees. No Limits."
                  />
                </div>
                <div>
                  <Label htmlFor="edit_hero_description">Description *</Label>
                  <Textarea
                    id="edit_hero_description"
                    value={heroFields.description}
                    onChange={(e) =>
                      setHeroFields((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Enter a detailed description"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_hero_primary_cta">Primary CTA Label</Label>
                  <Input
                    id="edit_hero_primary_cta"
                    value={heroFields.primaryCtaLabel}
                    onChange={(e) =>
                      setHeroFields((prev) => ({ ...prev, primaryCtaLabel: e.target.value }))
                    }
                    placeholder="e.g., START BUILDING"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_hero_secondary_cta">Secondary CTA Label</Label>
                  <Input
                    id="edit_hero_secondary_cta"
                    value={heroFields.secondaryCtaLabel}
                    onChange={(e) =>
                      setHeroFields((prev) => ({ ...prev, secondaryCtaLabel: e.target.value }))
                    }
                    placeholder="e.g., BOOK A DEMO"
                  />
                </div>
              </div>
            ) : editingSection?.section_key === "how-it-works" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_hiw_title">Title *</Label>
                  <Input
                    id="edit_hiw_title"
                    value={howItWorksFields.title}
                    onChange={(e) =>
                      setHowItWorksFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., How it works"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Steps *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addStep}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Step
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[400px] overflow-y-auto">
                    {howItWorksFields.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Step {stepIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(stepIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`edit_step_title_${stepIndex}`}>Step Title</Label>
                            <Input
                              id={`edit_step_title_${stepIndex}`}
                              value={step.title}
                              onChange={(e) => updateStep(stepIndex, "title", e.target.value)}
                              placeholder="e.g., Step 1: Choose Your Country ðŸŒ"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_step_emoji_${stepIndex}`}>Emoji</Label>
                            <Input
                              id={`edit_step_emoji_${stepIndex}`}
                              value={step.emoji}
                              onChange={(e) => updateStep(stepIndex, "emoji", e.target.value)}
                              placeholder="e.g., ðŸŒ"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_step_element_type_${stepIndex}`}>Element Type</Label>
                            <Input
                              id={`edit_step_element_type_${stepIndex}`}
                              value={step.elements[0]?.type || "globe"}
                              onChange={(e) =>
                                updateStepElement(stepIndex, 0, "type", e.target.value)
                              }
                              placeholder="e.g., globe, cards, input, crypto, dashboard, launch"
                            />
                          </div>

                          {step.elements[0]?.type === "cards" && (
                            <div className="mt-4 space-y-3 border-t pt-4">
                              <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                                Pricing cards for this step now use the global Pricing plans. Update the
                                plans from the Pricing section above to change what appears here.
                              </div>
                            </div>
                          )}

                          {step.elements[0]?.type === "input" && (
                            <div className="mt-4">
                              <Label htmlFor={`edit_step_element_content_${stepIndex}`}>Input Content</Label>
                              <Input
                                id={`edit_step_element_content_${stepIndex}`}
                                value={step.elements[0]?.content || ""}
                                onChange={(e) =>
                                  updateStepElement(stepIndex, 0, "content", e.target.value)
                                }
                                placeholder="e.g., LuckyDice.io"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {howItWorksFields.steps.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No steps added. Click "Add Step" to add one.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_hiw_step_duration">Step Duration (ms)</Label>
                    <Input
                      id="edit_hiw_step_duration"
                      type="number"
                      value={howItWorksFields.timing.stepDuration}
                      onChange={(e) =>
                        setHowItWorksFields((prev) => ({
                          ...prev,
                          timing: { ...prev.timing, stepDuration: parseInt(e.target.value) || 4000 },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_hiw_transition_duration">Transition Duration (ms)</Label>
                    <Input
                      id="edit_hiw_transition_duration"
                      type="number"
                      value={howItWorksFields.timing.transitionDuration}
                      onChange={(e) =>
                        setHowItWorksFields((prev) => ({
                          ...prev,
                          timing: {
                            ...prev.timing,
                            transitionDuration: parseInt(e.target.value) || 800,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            ) : editingSection?.section_key === "pick-your-focus" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_pyf_header">Header *</Label>
                  <Input
                    id="edit_pyf_header"
                    value={pickYourFocusFields.header}
                    onChange={(e) =>
                      setPickYourFocusFields((prev) => ({ ...prev, header: e.target.value }))
                    }
                    placeholder="e.g., Pick Your Focus"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_pyf_subtitle">Subtitle *</Label>
                  <Input
                    id="edit_pyf_subtitle"
                    value={pickYourFocusFields.subtitle}
                    onChange={(e) =>
                      setPickYourFocusFields((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="e.g., Sportsbook, Casino, Sweepstakes, or Lotteryâ€”choose your model."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Categories *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCategory}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Category
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[500px] overflow-y-auto">
                    {pickYourFocusFields.categories.map((category, catIndex) => (
                      <div key={catIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Category {catIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCategory(catIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`edit_cat_id_${catIndex}`}>ID</Label>
                            <Input
                              id={`edit_cat_id_${catIndex}`}
                              value={category.id}
                              onChange={(e) => updateCategory(catIndex, "id", e.target.value)}
                              placeholder="e.g., casino"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_cat_title_${catIndex}`}>Title</Label>
                            <Input
                              id={`edit_cat_title_${catIndex}`}
                              value={category.title}
                              onChange={(e) => updateCategory(catIndex, "title", e.target.value)}
                              placeholder="e.g., Casino"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_cat_description_${catIndex}`}>Description</Label>
                            <Textarea
                              id={`edit_cat_description_${catIndex}`}
                              value={category.description}
                              onChange={(e) => updateCategory(catIndex, "description", e.target.value)}
                              placeholder="e.g., Over 15'000 most popular games included"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_cat_image_${catIndex}`}>Image</Label>
                            <div className="space-y-2">
                              {category.imageUrl && (
                                <div className="relative w-32 h-32 border rounded overflow-hidden">
                                  <img
                                    src={category.imageUrl.startsWith("http") ? category.imageUrl : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"}${category.imageUrl}`}
                                    alt={category.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <Input
                                id={`edit_cat_image_${catIndex}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(catIndex, file);
                                  }
                                }}
                                disabled={uploadingImages[`category_${catIndex}`]}
                              />
                              {uploadingImages[`category_${catIndex}`] && (
                                <p className="text-xs text-muted-foreground">Uploading...</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pickYourFocusFields.categories.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No categories added. Click "Add Category" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : editingSection?.section_key === "features" ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Feature Items *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    {featuresFields.items.map((feature, featIndex) => (
                      <div key={featIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Feature {featIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(featIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`edit_feat_id_${featIndex}`}>ID *</Label>
                            <Input
                              id={`edit_feat_id_${featIndex}`}
                              value={feature.id}
                              onChange={(e) => updateFeature(featIndex, "id", e.target.value)}
                              placeholder="e.g., configure-payments"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_feat_title_${featIndex}`}>Title *</Label>
                            <Input
                              id={`edit_feat_title_${featIndex}`}
                              value={feature.title}
                              onChange={(e) => updateFeature(featIndex, "title", e.target.value)}
                              placeholder="e.g., Configure Payments"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_feat_description_${featIndex}`}>Description *</Label>
                            <Textarea
                              id={`edit_feat_description_${featIndex}`}
                              value={feature.description}
                              onChange={(e) => updateFeature(featIndex, "description", e.target.value)}
                              placeholder="e.g., Integrate 300+ fiat and crypto methods in just a few clicks."
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_feat_image_${featIndex}`}>Image</Label>
                            <div className="space-y-2">
                              {feature.imageUrl && (
                                <div className="relative w-32 h-32 border rounded overflow-hidden">
                                  <img
                                    src={feature.imageUrl.startsWith("http") ? feature.imageUrl : `${BACKEND_BASE_URL}${feature.imageUrl}`}
                                    alt={feature.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                              <Input
                                id={`edit_feat_image_${featIndex}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(featIndex, file, "features");
                                  }
                                }}
                                disabled={uploadingImages[`feature_${featIndex}`]}
                              />
                              {uploadingImages[`feature_${featIndex}`] && (
                                <p className="text-xs text-muted-foreground">Uploading...</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {featuresFields.items.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No features added. Click "Add Feature" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : contentForm.section_key === "audience-cards" ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Audience Cards *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAudienceCard}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Card
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    {audienceCardsFields.cards.map((card, cardIndex) => (
                      <div key={cardIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Card {cardIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAudienceCard(cardIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`card_id_${cardIndex}`}>ID *</Label>
                            <Input
                              id={`card_id_${cardIndex}`}
                              value={card.id}
                              onChange={(e) => updateAudienceCard(cardIndex, "id", e.target.value)}
                              placeholder="e.g., casino-operators"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`card_heading_${cardIndex}`}>Heading *</Label>
                            <Input
                              id={`card_heading_${cardIndex}`}
                              value={card.heading}
                              onChange={(e) => updateAudienceCard(cardIndex, "heading", e.target.value)}
                              placeholder="e.g., For Casino Operators"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`card_subheading_${cardIndex}`}>Subheading *</Label>
                            <Input
                              id={`card_subheading_${cardIndex}`}
                              value={card.subheading}
                              onChange={(e) => updateAudienceCard(cardIndex, "subheading", e.target.value)}
                              placeholder="e.g., Scale into New Marketsâ€”instantly"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`card_cta_${cardIndex}`}>CTA Text *</Label>
                            <Input
                              id={`card_cta_${cardIndex}`}
                              value={card.ctaText}
                              onChange={(e) => updateAudienceCard(cardIndex, "ctaText", e.target.value)}
                              placeholder="e.g., SCALE FASTER WITH MAINCARD"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Checklist Items *</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addChecklistItem(cardIndex)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Item
                              </Button>
                            </div>
                            <div className="space-y-2 border rounded p-2">
                              {card.checklistItems.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex gap-2">
                                  <Input
                                    value={item}
                                    onChange={(e) => updateChecklistItem(cardIndex, itemIndex, e.target.value)}
                                    placeholder="Enter checklist item"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeChecklistItem(cardIndex, itemIndex)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {card.checklistItems.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  No items added. Click "Add Item" to add one.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {audienceCardsFields.cards.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No cards added. Click "Add Card" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : contentForm.section_key === "key-differences" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="kd_title">Title *</Label>
                  <Input
                    id="kd_title"
                    value={keyDifferencesFields.title}
                    onChange={(e) =>
                      setKeyDifferencesFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., Key Differences"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Features *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addKeyDifferenceFeature}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    {keyDifferencesFields.features.map((feature, featIndex) => (
                      <div key={featIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Feature {featIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeKeyDifferenceFeature(featIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`kd_feat_text_${featIndex}`}>Text *</Label>
                            <Textarea
                              id={`kd_feat_text_${featIndex}`}
                              value={feature.text}
                              onChange={(e) => updateKeyDifferenceFeature(featIndex, "text", e.target.value)}
                              placeholder="e.g., 10'000x faster than any other provider in the market"
                              rows={2}
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Sub Items (Optional)</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addKeyDifferenceSubItem(featIndex)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Sub Item
                              </Button>
                            </div>
                            <div className="space-y-2 border rounded p-2">
                              {(feature.subItems || []).map((subItem, subIndex) => (
                                <div key={subIndex} className="flex gap-2">
                                  <Input
                                    value={subItem}
                                    onChange={(e) => updateKeyDifferenceSubItem(featIndex, subIndex, e.target.value)}
                                    placeholder="Enter sub item text"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeKeyDifferenceSubItem(featIndex, subIndex)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {(!feature.subItems || feature.subItems.length === 0) && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  No sub items added. Click "Add Sub Item" to add one.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {keyDifferencesFields.features.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No features added. Click "Add Feature" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : contentForm.section_key === "pricing" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pricing_title">Title *</Label>
                  <Input
                    id="pricing_title"
                    value={pricingFields.title}
                    onChange={(e) =>
                      setPricingFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., Pricing"
                  />
                </div>
                <div>
                  <Label htmlFor="pricing_subtitle">Subtitle *</Label>
                  <Textarea
                    id="pricing_subtitle"
                    value={pricingFields.subtitle}
                    onChange={(e) =>
                      setPricingFields((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="e.g., You pick the approach based on your confidence. We help you grow."
                    rows={2}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Plans *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPricingPlan}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Plan
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    {pricingFields.plans.map((plan, planIndex) => (
                      <div key={planIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Plan {planIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePricingPlan(planIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`plan_name_${planIndex}`}>Plan Name *</Label>
                            <Input
                              id={`plan_name_${planIndex}`}
                              value={plan.name}
                              onChange={(e) => updatePricingPlan(planIndex, "name", e.target.value)}
                              placeholder="e.g., The Cautious Creator"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`plan_id_${planIndex}`}>Plan ID *</Label>
                            <Input
                              id={`plan_id_${planIndex}`}
                              value={plan.id}
                              onChange={(e) => updatePricingPlan(planIndex, "id", e.target.value)}
                              placeholder="e.g., starter"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`plan_badge_${planIndex}`}>Badge Label</Label>
                            <Input
                              id={`plan_badge_${planIndex}`}
                              value={plan.badge || ""}
                              onChange={(e) => updatePricingPlan(planIndex, "badge", e.target.value)}
                              placeholder="e.g., Popular"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`plan_description_${planIndex}`}>Description</Label>
                            <Textarea
                              id={`plan_description_${planIndex}`}
                              value={plan.description || ""}
                              onChange={(e) => updatePricingPlan(planIndex, "description", e.target.value)}
                              rows={2}
                              placeholder="Short description for dialogs"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`plan_price_display_${planIndex}`}>Price Display *</Label>
                              <Input
                                id={`plan_price_display_${planIndex}`}
                                value={plan.priceDisplay}
                                onChange={(e) => updatePricingPlan(planIndex, "priceDisplay", e.target.value)}
                                placeholder={`e.g., ${CURRENCY} 99.00`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`plan_currency_${planIndex}`}>Currency</Label>
                              <Input
                                id={`plan_currency_${planIndex}`}
                                value={plan.currency || ""}
                                onChange={(e) => updatePricingPlan(planIndex, "currency", e.target.value)}
                                placeholder={`e.g., ${CURRENCY}`}
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={plan.hasThemeStudio ?? false}
                              onCheckedChange={(checked) => updatePricingPlan(planIndex, "hasThemeStudio", checked)}
                            />
                            <span>Includes Theme Studio access</span>
                          </div>
                          <div>
                            <Label htmlFor={`plan_setup_label_${planIndex}`}>Setup Fee Label *</Label>
                            <Input
                              id={`plan_setup_label_${planIndex}`}
                              value={plan.setupFee.label}
                              onChange={(e) => updatePricingPlanSetupFee(planIndex, "label", e.target.value)}
                              placeholder="e.g., One-time setup fee:"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`plan_setup_amount_${planIndex}`}>Setup Fee Amount *</Label>
                            <Input
                              id={`plan_setup_amount_${planIndex}`}
                              value={plan.setupFee.amount}
                              onChange={(e) => updatePricingPlanSetupFee(planIndex, "amount", e.target.value)}
                              placeholder="e.g., ₱4,999"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`plan_sub_label_${planIndex}`}>Subscription Label *</Label>
                            <Input
                              id={`plan_sub_label_${planIndex}`}
                              value={plan.subscription.label}
                              onChange={(e) => updatePricingPlanSubscription(planIndex, "label", e.target.value)}
                              placeholder="e.g., Monthly subscription:"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`plan_sub_amount_${planIndex}`}>Subscription Amount *</Label>
                            <Input
                              id={`plan_sub_amount_${planIndex}`}
                              value={plan.subscription.amount}
                              onChange={(e) => updatePricingPlanSubscription(planIndex, "amount", e.target.value)}
                              placeholder="e.g., ₱799 or None"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`plan_sub_note_${planIndex}`}>Subscription Note</Label>
                            <Input
                              id={`plan_sub_note_${planIndex}`}
                              value={plan.subscription.note}
                              onChange={(e) => updatePricingPlanSubscription(planIndex, "note", e.target.value)}
                              placeholder="e.g., Revenue-sharing: 0% of the GRR"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`plan_button_${planIndex}`}>Button Text *</Label>
                            <Input
                              id={`plan_button_${planIndex}`}
                              value={plan.button}
                              onChange={(e) => updatePricingPlan(planIndex, "button", e.target.value)}
                              placeholder="e.g., CHOOSE A PLAN"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`plan_features_${planIndex}`}>Features (one per line)</Label>
                            <Textarea
                              id={`plan_features_${planIndex}`}
                              value={(plan.features || []).join('\n')}
                              onChange={(e) => updatePricingPlanFeatures(planIndex, e.target.value)}
                              rows={4}
                              placeholder="List benefits or perks"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {pricingFields.plans.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No plans added. Click "Add Plan" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : contentForm.section_key === "footer" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="footer_newsletter_title">Newsletter Title *</Label>
                  <Input
                    id="footer_newsletter_title"
                    value={footerFields.newsletter.title}
                    onChange={(e) => updateFooterNewsletter("title", e.target.value)}
                    placeholder="e.g., Build Your Casino Empire"
                  />
                </div>
                <div>
                  <Label htmlFor="footer_newsletter_description">Newsletter Description *</Label>
                  <Textarea
                    id="footer_newsletter_description"
                    value={footerFields.newsletter.description}
                    onChange={(e) => updateFooterNewsletter("description", e.target.value)}
                    placeholder="e.g., Get the latest casino builder updates, industry insights, and exclusive offers. Launch your iGaming platform in 30 minutes."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_newsletter_placeholder">Email Placeholder</Label>
                  <Input
                    id="footer_newsletter_placeholder"
                    value={footerFields.newsletter.emailPlaceholder}
                    onChange={(e) => updateFooterNewsletter("emailPlaceholder", e.target.value)}
                    placeholder="e.g., your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="footer_newsletter_button">Button Text *</Label>
                  <Input
                    id="footer_newsletter_button"
                    value={footerFields.newsletter.buttonText}
                    onChange={(e) => updateFooterNewsletter("buttonText", e.target.value)}
                    placeholder="e.g., Get Started"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Navigation Links</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFooterNavigation}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Link
                    </Button>
                  </div>
                  <div className="space-y-2 border rounded p-2">
                    {footerFields.navigation.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex gap-2">
                        <Input
                          value={link.label}
                          onChange={(e) => updateFooterNavigation(linkIndex, "label", e.target.value)}
                          placeholder="Link label"
                          className="flex-1"
                        />
                        <Input
                          value={link.href}
                          onChange={(e) => updateFooterNavigation(linkIndex, "href", e.target.value)}
                          placeholder="Link URL"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFooterNavigation(linkIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {footerFields.navigation.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No links added. Click "Add Link" to add one.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Social Media Links</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFooterSocial}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Social
                    </Button>
                  </div>
                  <div className="space-y-2 border rounded p-2">
                    {footerFields.social.map((social, socialIndex) => (
                      <div key={socialIndex} className="space-y-2 border rounded p-2">
                        <div className="flex gap-2">
                          <Input
                            value={social.name}
                            onChange={(e) => updateFooterSocial(socialIndex, "name", e.target.value)}
                            placeholder="Social name (e.g., LinkedIn)"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFooterSocial(socialIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={social.href}
                          onChange={(e) => updateFooterSocial(socialIndex, "href", e.target.value)}
                          placeholder="Social URL"
                        />
                          <div>
                            <Label htmlFor={`social_icon_${socialIndex}`}>Icon</Label>
                            <Input
                              id={`social_icon_${socialIndex}`}
                              value={social.icon}
                              onChange={(e) => updateFooterSocial(socialIndex, "icon", e.target.value)}
                              placeholder="e.g., linkedin, twitter, telegram"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Options: linkedin, twitter, telegram, facebook, instagram, youtube
                            </p>
                          </div>
                      </div>
                    ))}
                    {footerFields.social.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No social links added. Click "Add Social" to add one.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="footer_copyright">Copyright *</Label>
                  <Input
                    id="footer_copyright"
                    value={footerFields.copyright}
                    onChange={(e) =>
                      setFooterFields((prev) => ({ ...prev, copyright: e.target.value }))
                    }
                    placeholder="e.g., Â© 2025 CSZGLOBAL. All rights reserved."
                  />
                </div>
              </div>
            ) : contentForm.section_key === "theme-settings" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme_selected">Selected Theme *</Label>
                  <select
                    id="theme_selected"
                    value={themeSettingsFields.selectedTheme}
                    onChange={(e) =>
                      setThemeSettingsFields((prev) => ({ ...prev, selectedTheme: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  >
                    <option value="maincard">Royal</option>
                    <option value="cyber">Cyber</option>
                    <option value="neon">Neon</option>
                    <option value="ocean">Ocean</option>
                    <option value="sunset">Sunset</option>
                    <option value="forest">Forest</option>
                    <option value="purple">Purple</option>
                    <option value="dark">Dark</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the theme that will be applied to the landing page
                  </p>
                </div>
              </div>
            ) : contentForm.section_key === "header-logo" ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="header_show_logo"
                    checked={headerLogoFields.showLogo}
                    onChange={(e) =>
                      setHeaderLogoFields((prev) => ({ ...prev, showLogo: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="header_show_logo">Show Logo Image</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="header_show_brand"
                    checked={headerLogoFields.showBrandName}
                    onChange={(e) =>
                      setHeaderLogoFields((prev) => ({ ...prev, showBrandName: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="header_show_brand">Show Brand Name</Label>
                </div>
                {headerLogoFields.showLogo && headerLogoFields.showBrandName && (
                  <div>
                    <Label htmlFor="header_order">Display Order *</Label>
                    <select
                      id="header_order"
                      value={headerLogoFields.order}
                      onChange={(e) =>
                        setHeaderLogoFields((prev) => ({
                          ...prev,
                          order: e.target.value as "logo-first" | "brand-first",
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                    >
                      <option value="brand-first">Brand Name First</option>
                      <option value="logo-first">Logo Image First</option>
                    </select>
                  </div>
                )}
                {headerLogoFields.showBrandName && (
                  <>
                    <div>
                      <Label htmlFor="header_brand_name">Brand Name *</Label>
                      <Input
                        id="header_brand_name"
                        value={headerLogoFields.brandName}
                        onChange={(e) =>
                          setHeaderLogoFields((prev) => ({ ...prev, brandName: e.target.value }))
                        }
                        placeholder="e.g., CSZGLOBAL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="header_brand_font_size">Brand Name Font Size *</Label>
                      <Input
                        id="header_brand_font_size"
                        value={headerLogoFields.brandNameFontSize}
                        onChange={(e) =>
                          setHeaderLogoFields((prev) => ({ ...prev, brandNameFontSize: e.target.value }))
                        }
                        placeholder="e.g., 1.5rem, 24px, 2em"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        CSS size value (e.g., 1.5rem, 24px, 2em)
                      </p>
                    </div>
                  </>
                )}
                {headerLogoFields.showLogo && (
                  <>
                    <div>
                      <Label htmlFor="header_logo_size">Logo Image Size *</Label>
                      <Input
                        id="header_logo_size"
                        value={headerLogoFields.logoImageSize}
                        onChange={(e) =>
                          setHeaderLogoFields((prev) => ({ ...prev, logoImageSize: e.target.value }))
                        }
                        placeholder="e.g., 40px, 3rem, 50px"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        CSS size value (e.g., 40px, 3rem, 50px)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="header_logo_upload">Logo Image *</Label>
                      <Input
                        id="header_logo_upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleHeaderLogoUpload(file);
                          }
                        }}
                        disabled={uploadingImages.header_logo}
                      />
                      {uploadingImages.header_logo && (
                        <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
                      )}
                      {headerLogoFields.logoImageUrl && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Current Logo:</p>
                          <img
                            src={headerLogoFields.logoImageUrl.startsWith("http") ? headerLogoFields.logoImageUrl : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"}${headerLogoFields.logoImageUrl}`}
                            alt="Logo preview"
                            className="max-w-[200px] max-h-[100px] object-contain border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : contentForm.section_key === "faq" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="faq_title">Title *</Label>
                  <Input
                    id="faq_title"
                    value={faqFields.title}
                    onChange={(e) => setFaqFields((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Frequently Asked Questions"
                  />
                </div>
                <div>
                  <Label htmlFor="faq_subtitle">Subtitle</Label>
                  <Input
                    id="faq_subtitle"
                    value={faqFields.subtitle}
                    onChange={(e) => setFaqFields((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g., Everything you need to know about our platform"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>FAQ Items *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFAQItem}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add FAQ Item
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    {faqFields.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">FAQ Item {itemIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFAQItem(itemIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`faq_question_${itemIndex}`}>Question *</Label>
                            <Input
                              id={`faq_question_${itemIndex}`}
                              value={item.question}
                              onChange={(e) => updateFAQItem(itemIndex, "question", e.target.value)}
                              placeholder="e.g., How quickly can I launch my iGaming platform?"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`faq_answer_${itemIndex}`}>Answer *</Label>
                            <textarea
                              id={`faq_answer_${itemIndex}`}
                              value={item.answer}
                              onChange={(e) => updateFAQItem(itemIndex, "answer", e.target.value)}
                              placeholder="e.g., You can launch your fully operational casino, sportsbook, or lottery platform in just 30 minutes."
                              className="w-full px-3 py-2 border rounded-md bg-background text-foreground min-h-[100px]"
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {faqFields.items.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No FAQ items added. Click "Add FAQ Item" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : contentForm.section_key === "features" ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Feature Items *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    {featuresFields.items.map((feature, featIndex) => (
                      <div key={featIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Feature {featIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(featIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`feat_id_${featIndex}`}>ID *</Label>
                            <Input
                              id={`feat_id_${featIndex}`}
                              value={feature.id}
                              onChange={(e) => updateFeature(featIndex, "id", e.target.value)}
                              placeholder="e.g., configure-payments"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`feat_title_${featIndex}`}>Title *</Label>
                            <Input
                              id={`feat_title_${featIndex}`}
                              value={feature.title}
                              onChange={(e) => updateFeature(featIndex, "title", e.target.value)}
                              placeholder="e.g., Configure Payments"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`feat_description_${featIndex}`}>Description *</Label>
                            <Textarea
                              id={`feat_description_${featIndex}`}
                              value={feature.description}
                              onChange={(e) => updateFeature(featIndex, "description", e.target.value)}
                              placeholder="e.g., Integrate 300+ fiat and crypto methods in just a few clicks."
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`feat_image_${featIndex}`}>Image</Label>
                            <div className="space-y-2">
                              {feature.imageUrl && (
                                <div className="relative w-32 h-32 border rounded overflow-hidden">
                                  <img
                                    src={feature.imageUrl.startsWith("http") ? feature.imageUrl : `${BACKEND_BASE_URL}${feature.imageUrl}`}
                                    alt={feature.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                              <Input
                                id={`feat_image_${featIndex}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(featIndex, file, "features");
                                  }
                                }}
                                disabled={uploadingImages[`feature_${featIndex}`]}
                              />
                              {uploadingImages[`feature_${featIndex}`] && (
                                <p className="text-xs text-muted-foreground">Uploading...</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {featuresFields.items.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No features added. Click "Add Feature" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : editingSection?.section_key === "audience-cards" ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Audience Cards *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAudienceCard}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Card
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    {audienceCardsFields.cards.map((card, cardIndex) => (
                      <div key={cardIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Card {cardIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAudienceCard(cardIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`edit_card_id_${cardIndex}`}>ID *</Label>
                            <Input
                              id={`edit_card_id_${cardIndex}`}
                              value={card.id}
                              onChange={(e) => updateAudienceCard(cardIndex, "id", e.target.value)}
                              placeholder="e.g., casino-operators"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_card_heading_${cardIndex}`}>Heading *</Label>
                            <Input
                              id={`edit_card_heading_${cardIndex}`}
                              value={card.heading}
                              onChange={(e) => updateAudienceCard(cardIndex, "heading", e.target.value)}
                              placeholder="e.g., For Casino Operators"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_card_subheading_${cardIndex}`}>Subheading *</Label>
                            <Input
                              id={`edit_card_subheading_${cardIndex}`}
                              value={card.subheading}
                              onChange={(e) => updateAudienceCard(cardIndex, "subheading", e.target.value)}
                              placeholder="e.g., Scale into New Marketsâ€”instantly"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_card_cta_${cardIndex}`}>CTA Text *</Label>
                            <Input
                              id={`edit_card_cta_${cardIndex}`}
                              value={card.ctaText}
                              onChange={(e) => updateAudienceCard(cardIndex, "ctaText", e.target.value)}
                              placeholder="e.g., SCALE FASTER WITH MAINCARD"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Checklist Items *</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addChecklistItem(cardIndex)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Item
                              </Button>
                            </div>
                            <div className="space-y-2 border rounded p-2">
                              {card.checklistItems.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex gap-2">
                                  <Input
                                    value={item}
                                    onChange={(e) => updateChecklistItem(cardIndex, itemIndex, e.target.value)}
                                    placeholder="Enter checklist item"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeChecklistItem(cardIndex, itemIndex)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {card.checklistItems.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  No items added. Click "Add Item" to add one.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {audienceCardsFields.cards.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No cards added. Click "Add Card" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : editingSection?.section_key === "key-differences" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_kd_title">Title *</Label>
                  <Input
                    id="edit_kd_title"
                    value={keyDifferencesFields.title}
                    onChange={(e) =>
                      setKeyDifferencesFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., Key Differences"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Features *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addKeyDifferenceFeature}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    {keyDifferencesFields.features.map((feature, featIndex) => (
                      <div key={featIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Feature {featIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeKeyDifferenceFeature(featIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`edit_kd_feat_text_${featIndex}`}>Text *</Label>
                            <Textarea
                              id={`edit_kd_feat_text_${featIndex}`}
                              value={feature.text}
                              onChange={(e) => updateKeyDifferenceFeature(featIndex, "text", e.target.value)}
                              placeholder="e.g., 10'000x faster than any other provider in the market"
                              rows={2}
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Sub Items (Optional)</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addKeyDifferenceSubItem(featIndex)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Sub Item
                              </Button>
                            </div>
                            <div className="space-y-2 border rounded p-2">
                              {(feature.subItems || []).map((subItem, subIndex) => (
                                <div key={subIndex} className="flex gap-2">
                                  <Input
                                    value={subItem}
                                    onChange={(e) => updateKeyDifferenceSubItem(featIndex, subIndex, e.target.value)}
                                    placeholder="Enter sub item text"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeKeyDifferenceSubItem(featIndex, subIndex)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {(!feature.subItems || feature.subItems.length === 0) && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  No sub items added. Click "Add Sub Item" to add one.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {keyDifferencesFields.features.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No features added. Click "Add Feature" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : editingSection?.section_key === "pricing" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_pricing_title">Title *</Label>
                  <Input
                    id="edit_pricing_title"
                    value={pricingFields.title}
                    onChange={(e) =>
                      setPricingFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., Pricing"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_pricing_subtitle">Subtitle *</Label>
                  <Textarea
                    id="edit_pricing_subtitle"
                    value={pricingFields.subtitle}
                    onChange={(e) =>
                      setPricingFields((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="e.g., You pick the approach based on your confidence. We help you grow."
                    rows={2}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Plans *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPricingPlan}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Plan
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    {pricingFields.plans.map((plan, planIndex) => (
                      <div key={planIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Plan {planIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePricingPlan(planIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`edit_plan_name_${planIndex}`}>Plan Name *</Label>
                            <Input
                              id={`edit_plan_name_${planIndex}`}
                              value={plan.name}
                              onChange={(e) => updatePricingPlan(planIndex, "name", e.target.value)}
                              placeholder="e.g., The Cautious Creator"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_plan_id_${planIndex}`}>Plan ID *</Label>
                            <Input
                              id={`edit_plan_id_${planIndex}`}
                              value={plan.id}
                              onChange={(e) => updatePricingPlan(planIndex, "id", e.target.value)}
                              placeholder="e.g., starter"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_plan_badge_${planIndex}`}>Badge Label</Label>
                            <Input
                              id={`edit_plan_badge_${planIndex}`}
                              value={plan.badge || ""}
                              onChange={(e) => updatePricingPlan(planIndex, "badge", e.target.value)}
                              placeholder="e.g., Popular"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_plan_description_${planIndex}`}>Description</Label>
                            <Textarea
                              id={`edit_plan_description_${planIndex}`}
                              value={plan.description || ""}
                              onChange={(e) => updatePricingPlan(planIndex, "description", e.target.value)}
                              rows={2}
                              placeholder="Short description for dialogs"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`edit_plan_price_display_${planIndex}`}>Price Display *</Label>
                              <Input
                                id={`edit_plan_price_display_${planIndex}`}
                                value={plan.priceDisplay}
                                onChange={(e) => updatePricingPlan(planIndex, "priceDisplay", e.target.value)}
                                placeholder={`e.g., ${CURRENCY} 99.00`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit_plan_currency_${planIndex}`}>Currency</Label>
                              <Input
                                id={`edit_plan_currency_${planIndex}`}
                                value={plan.currency || ""}
                                onChange={(e) => updatePricingPlan(planIndex, "currency", e.target.value)}
                                placeholder={`e.g., ${CURRENCY}`}
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={plan.hasThemeStudio ?? false}
                              onCheckedChange={(checked) => updatePricingPlan(planIndex, "hasThemeStudio", checked)}
                            />
                            <span>Includes Theme Studio access</span>
                          </div>
                          <div>
                            <Label htmlFor={`edit_plan_setup_label_${planIndex}`}>Setup Fee Label *</Label>
                            <Input
                              id={`edit_plan_setup_label_${planIndex}`}
                              value={plan.setupFee.label}
                              onChange={(e) => updatePricingPlanSetupFee(planIndex, "label", e.target.value)}
                              placeholder="e.g., One-time setup fee:"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_plan_setup_amount_${planIndex}`}>Setup Fee Amount *</Label>
                            <Input
                              id={`edit_plan_setup_amount_${planIndex}`}
                              value={plan.setupFee.amount}
                              onChange={(e) => updatePricingPlanSetupFee(planIndex, "amount", e.target.value)}
                              placeholder="e.g., ₱4,999"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_plan_sub_label_${planIndex}`}>Subscription Label *</Label>
                            <Input
                              id={`edit_plan_sub_label_${planIndex}`}
                              value={plan.subscription.label}
                              onChange={(e) => updatePricingPlanSubscription(planIndex, "label", e.target.value)}
                              placeholder="e.g., Monthly subscription:"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_plan_sub_amount_${planIndex}`}>Subscription Amount *</Label>
                            <Input
                              id={`edit_plan_sub_amount_${planIndex}`}
                              value={plan.subscription.amount}
                              onChange={(e) => updatePricingPlanSubscription(planIndex, "amount", e.target.value)}
                              placeholder="e.g., ₱799 or None"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_plan_sub_note_${planIndex}`}>Subscription Note</Label>
                            <Input
                              id={`edit_plan_sub_note_${planIndex}`}
                              value={plan.subscription.note}
                              onChange={(e) => updatePricingPlanSubscription(planIndex, "note", e.target.value)}
                              placeholder="e.g., Revenue-sharing: 0% of the GRR"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_plan_button_${planIndex}`}>Button Text *</Label>
                            <Input
                              id={`edit_plan_button_${planIndex}`}
                              value={plan.button}
                              onChange={(e) => updatePricingPlan(planIndex, "button", e.target.value)}
                              placeholder="e.g., CHOOSE A PLAN"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_plan_features_${planIndex}`}>Features (one per line)</Label>
                            <Textarea
                              id={`edit_plan_features_${planIndex}`}
                              value={(plan.features || []).join('\n')}
                              onChange={(e) => updatePricingPlanFeatures(planIndex, e.target.value)}
                              rows={4}
                              placeholder="List benefits or perks"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {pricingFields.plans.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No plans added. Click "Add Plan" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : editingSection?.section_key === "footer" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_footer_newsletter_title">Newsletter Title *</Label>
                  <Input
                    id="edit_footer_newsletter_title"
                    value={footerFields.newsletter.title}
                    onChange={(e) => updateFooterNewsletter("title", e.target.value)}
                    placeholder="e.g., Build Your Casino Empire"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_footer_newsletter_description">Newsletter Description *</Label>
                  <Textarea
                    id="edit_footer_newsletter_description"
                    value={footerFields.newsletter.description}
                    onChange={(e) => updateFooterNewsletter("description", e.target.value)}
                    placeholder="e.g., Get the latest casino builder updates, industry insights, and exclusive offers. Launch your iGaming platform in 30 minutes."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_footer_newsletter_placeholder">Email Placeholder</Label>
                  <Input
                    id="edit_footer_newsletter_placeholder"
                    value={footerFields.newsletter.emailPlaceholder}
                    onChange={(e) => updateFooterNewsletter("emailPlaceholder", e.target.value)}
                    placeholder="e.g., your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_footer_newsletter_button">Button Text *</Label>
                  <Input
                    id="edit_footer_newsletter_button"
                    value={footerFields.newsletter.buttonText}
                    onChange={(e) => updateFooterNewsletter("buttonText", e.target.value)}
                    placeholder="e.g., Get Started"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Navigation Links</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFooterNavigation}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Link
                    </Button>
                  </div>
                  <div className="space-y-2 border rounded p-2">
                    {footerFields.navigation.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex gap-2">
                        <Input
                          value={link.label}
                          onChange={(e) => updateFooterNavigation(linkIndex, "label", e.target.value)}
                          placeholder="Link label"
                          className="flex-1"
                        />
                        <Input
                          value={link.href}
                          onChange={(e) => updateFooterNavigation(linkIndex, "href", e.target.value)}
                          placeholder="Link URL"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFooterNavigation(linkIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {footerFields.navigation.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No links added. Click "Add Link" to add one.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Social Media Links</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFooterSocial}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Social
                    </Button>
                  </div>
                  <div className="space-y-2 border rounded p-2">
                    {footerFields.social.map((social, socialIndex) => (
                      <div key={socialIndex} className="space-y-2 border rounded p-2">
                        <div className="flex gap-2">
                          <Input
                            value={social.name}
                            onChange={(e) => updateFooterSocial(socialIndex, "name", e.target.value)}
                            placeholder="Social name (e.g., LinkedIn)"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFooterSocial(socialIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={social.href}
                          onChange={(e) => updateFooterSocial(socialIndex, "href", e.target.value)}
                          placeholder="Social URL"
                        />
                        <div>
                          <Label htmlFor={`edit_social_icon_${socialIndex}`}>Icon</Label>
                          <Input
                            id={`edit_social_icon_${socialIndex}`}
                            value={social.icon}
                            onChange={(e) => updateFooterSocial(socialIndex, "icon", e.target.value)}
                            placeholder="e.g., linkedin, twitter, telegram"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Options: linkedin, twitter, telegram, facebook, instagram, youtube
                          </p>
                        </div>
                      </div>
                    ))}
                    {footerFields.social.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No social links added. Click "Add Social" to add one.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit_footer_copyright">Copyright *</Label>
                  <Input
                    id="edit_footer_copyright"
                    value={footerFields.copyright}
                    onChange={(e) =>
                      setFooterFields((prev) => ({ ...prev, copyright: e.target.value }))
                    }
                    placeholder="e.g., Â© 2025 CSZGLOBAL. All rights reserved."
                  />
                </div>
              </div>
            ) : editingSection?.section_key === "theme-settings" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_theme_selected">Selected Theme *</Label>
                  <select
                    id="edit_theme_selected"
                    value={themeSettingsFields.selectedTheme}
                    onChange={(e) =>
                      setThemeSettingsFields((prev) => ({ ...prev, selectedTheme: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  >
                    <option value="maincard">Royal</option>
                    <option value="cyber">Cyber</option>
                    <option value="neon">Neon</option>
                    <option value="ocean">Ocean</option>
                    <option value="sunset">Sunset</option>
                    <option value="forest">Forest</option>
                    <option value="purple">Purple</option>
                    <option value="dark">Dark</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the theme that will be applied to the landing page
                  </p>
                </div>
              </div>
            ) : editingSection?.section_key === "header-logo" ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_header_show_logo"
                    checked={headerLogoFields.showLogo}
                    onChange={(e) =>
                      setHeaderLogoFields((prev) => ({ ...prev, showLogo: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="edit_header_show_logo">Show Logo Image</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_header_show_brand"
                    checked={headerLogoFields.showBrandName}
                    onChange={(e) =>
                      setHeaderLogoFields((prev) => ({ ...prev, showBrandName: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="edit_header_show_brand">Show Brand Name</Label>
                </div>
                {headerLogoFields.showLogo && headerLogoFields.showBrandName && (
                  <div>
                    <Label htmlFor="edit_header_order">Display Order *</Label>
                    <select
                      id="edit_header_order"
                      value={headerLogoFields.order}
                      onChange={(e) =>
                        setHeaderLogoFields((prev) => ({
                          ...prev,
                          order: e.target.value as "logo-first" | "brand-first",
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                    >
                      <option value="brand-first">Brand Name First</option>
                      <option value="logo-first">Logo Image First</option>
                    </select>
                  </div>
                )}
                {headerLogoFields.showBrandName && (
                  <>
                    <div>
                      <Label htmlFor="edit_header_brand_name">Brand Name *</Label>
                      <Input
                        id="edit_header_brand_name"
                        value={headerLogoFields.brandName}
                        onChange={(e) =>
                          setHeaderLogoFields((prev) => ({ ...prev, brandName: e.target.value }))
                        }
                        placeholder="e.g., CSZGLOBAL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_header_brand_font_size">Brand Name Font Size *</Label>
                      <Input
                        id="edit_header_brand_font_size"
                        value={headerLogoFields.brandNameFontSize}
                        onChange={(e) =>
                          setHeaderLogoFields((prev) => ({ ...prev, brandNameFontSize: e.target.value }))
                        }
                        placeholder="e.g., 1.5rem, 24px, 2em"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        CSS size value (e.g., 1.5rem, 24px, 2em)
                      </p>
                    </div>
                  </>
                )}
                {headerLogoFields.showLogo && (
                  <>
                    <div>
                      <Label htmlFor="edit_header_logo_size">Logo Image Size *</Label>
                      <Input
                        id="edit_header_logo_size"
                        value={headerLogoFields.logoImageSize}
                        onChange={(e) =>
                          setHeaderLogoFields((prev) => ({ ...prev, logoImageSize: e.target.value }))
                        }
                        placeholder="e.g., 40px, 3rem, 50px"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        CSS size value (e.g., 40px, 3rem, 50px)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="edit_header_logo_upload">Logo Image *</Label>
                      <Input
                        id="edit_header_logo_upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleHeaderLogoUpload(file);
                          }
                        }}
                        disabled={uploadingImages.header_logo}
                      />
                      {uploadingImages.header_logo && (
                        <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
                      )}
                      {headerLogoFields.logoImageUrl && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Current Logo:</p>
                          <img
                            src={headerLogoFields.logoImageUrl.startsWith("http") ? headerLogoFields.logoImageUrl : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"}${headerLogoFields.logoImageUrl}`}
                            alt="Logo preview"
                            className="max-w-[200px] max-h-[100px] object-contain border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : editingSection?.section_key === "faq" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_faq_title">Title *</Label>
                  <Input
                    id="edit_faq_title"
                    value={faqFields.title}
                    onChange={(e) => setFaqFields((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Frequently Asked Questions"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_faq_subtitle">Subtitle</Label>
                  <Input
                    id="edit_faq_subtitle"
                    value={faqFields.subtitle}
                    onChange={(e) => setFaqFields((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g., Everything you need to know about our platform"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>FAQ Items *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFAQItem}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add FAQ Item
                    </Button>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    {faqFields.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">FAQ Item {itemIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFAQItem(itemIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`edit_faq_question_${itemIndex}`}>Question *</Label>
                            <Input
                              id={`edit_faq_question_${itemIndex}`}
                              value={item.question}
                              onChange={(e) => updateFAQItem(itemIndex, "question", e.target.value)}
                              placeholder="e.g., How quickly can I launch my iGaming platform?"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_faq_answer_${itemIndex}`}>Answer *</Label>
                            <textarea
                              id={`edit_faq_answer_${itemIndex}`}
                              value={item.answer}
                              onChange={(e) => updateFAQItem(itemIndex, "answer", e.target.value)}
                              placeholder="e.g., You can launch your fully operational casino, sportsbook, or lottery platform in just 30 minutes."
                              className="w-full px-3 py-2 border rounded-md bg-background text-foreground min-h-[100px]"
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {faqFields.items.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No FAQ items added. Click "Add FAQ Item" to add one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="edit_content_json">Content (JSON)</Label>
                <Textarea
                  id="edit_content_json"
                  value={JSON.stringify(contentForm.content || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setContentForm((prev) => ({ ...prev, content: parsed }));
                    } catch {
                    }
                  }}
                  placeholder='{"key": "value"}'
                  className="font-mono text-sm min-h-[300px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter valid JSON content for this section
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSection}
              disabled={updateSectionMutation.isPending}
            >
              {updateSectionMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
