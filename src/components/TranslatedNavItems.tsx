
import React from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

type NavItemProps = {
  to: string;
  translationKey: string;
  icon?: React.ReactNode;
  className?: string;
};

export const TranslatedNavItem = ({ to, translationKey, icon, className }: NavItemProps) => {
  const { t } = useI18n();
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground",
        className
      )}
    >
      {icon}
      <span>{t(translationKey)}</span>
    </Link>
  );
};
