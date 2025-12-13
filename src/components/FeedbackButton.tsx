import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const isBrowser = typeof window !== "undefined";

const ratingLabels = [
  "매우 불만족",
  "불만족",
  "보통",
  "만족",
  "매우 만족",
];

export function FeedbackButton() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isBrowser) {
    return null;
  }

  const handleSubmit = async () => {
    if (rating === null) {
      toast.error("만족도를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("user_feedback").insert({
        satisfaction_rating: rating,
        improvement_suggestion: suggestion.trim() || null,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        page_url: window.location.href,
      });

      if (error) throw error;

      toast.success("소중한 의견 감사합니다!");
      setRating(null);
      setSuggestion("");
      setOpen(false);
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("피드백 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(null);
    setSuggestion("");
  };

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4" 
        side="top" 
        align="end"
        sideOffset={12}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">피드백</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground">
              제주스냅찾기 서비스에 얼마나 만족하시나요?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md border transition-colors",
                    rating === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            {rating && (
              <p className="text-xs text-muted-foreground text-center">
                {ratingLabels[rating - 1]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground">
              서비스가 더 개선되었으면 하는 지점이 있다면 남겨주세요.
            </p>
            <Textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="의견을 자유롭게 작성해주세요..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === null}
            className="w-full"
          >
            {isSubmitting ? "제출 중..." : "제출하기"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
