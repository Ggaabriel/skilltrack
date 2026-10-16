import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

type BackButtonProps = { fallbackTo: string };

export function BackButton({ fallbackTo }: BackButtonProps) {
  const navigate = useNavigate();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={goBack}
      aria-label="Go back"
    >
      <ArrowLeft />
    </Button>
  );
}
