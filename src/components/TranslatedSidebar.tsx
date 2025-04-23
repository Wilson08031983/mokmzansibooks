
import React from "react";
import { useI18n } from "@/contexts/I18nContext";
import {
  Users,
  FileText,
  Calculator,
  Package,
  BadgeHelp,
  CreditCard,
  Settings,
  ChevronDown,
  PieChart,
  UserCircle
} from "lucide-react";
import { TranslatedNavItem } from "./TranslatedNavItems";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useState } from "react";

export const TranslatedNavigation = () => {
  const { t } = useI18n();
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(false);
  const [isAccountingOpen, setIsAccountingOpen] = useState(false);
  const [isHROpen, setIsHROpen] = useState(false);

  return (
    <nav className="space-y-1">
      <TranslatedNavItem
        to="/clients"
        translationKey="clients"
        icon={<Users className="h-4 w-4" />}
      />
      
      <Collapsible
        open={isInvoicesOpen}
        onOpenChange={setIsInvoicesOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex w-full items-center justify-between px-3 py-2 text-sm font-normal"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4" />
              <span>{t("invoices")}</span>
            </div>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", {
                "transform rotate-180": isInvoicesOpen,
              })}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-9 space-y-1">
          <TranslatedNavItem to="/invoices" translationKey="invoices" />
          <TranslatedNavItem to="/invoices/quotes" translationKey="quotes" />
        </CollapsibleContent>
      </Collapsible>

      <Collapsible
        open={isAccountingOpen}
        onOpenChange={setIsAccountingOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex w-full items-center justify-between px-3 py-2 text-sm font-normal"
            )}
          >
            <div className="flex items-center gap-3">
              <Calculator className="h-4 w-4" />
              <span>{t("accounting")}</span>
            </div>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", {
                "transform rotate-180": isAccountingOpen,
              })}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-9 space-y-1">
          {/* Accounting subitems can be added here */}
        </CollapsibleContent>
      </Collapsible>

      <TranslatedNavItem
        to="/inventory"
        translationKey="inventory"
        icon={<Package className="h-4 w-4" />}
      />

      <Collapsible
        open={isHROpen}
        onOpenChange={setIsHROpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex w-full items-center justify-between px-3 py-2 text-sm font-normal"
            )}
          >
            <div className="flex items-center gap-3">
              <UserCircle className="h-4 w-4" />
              <span>{t("hr")}</span>
            </div>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", {
                "transform rotate-180": isHROpen,
              })}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-9 space-y-1">
          {/* HR subitems can be added here */}
        </CollapsibleContent>
      </Collapsible>

      <TranslatedNavItem
        to="/reports"
        translationKey="reports"
        icon={<PieChart className="h-4 w-4" />}
      />

      <TranslatedNavItem
        to="/settings"
        translationKey="settings"
        icon={<Settings className="h-4 w-4" />}
      />
    </nav>
  );
};
