import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, CreditCard, Wallet, History } from "lucide-react";

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="loans" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Loans</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Users</span>
        </TabsTrigger>
        <TabsTrigger value="transactions" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">Transactions</span>
        </TabsTrigger>
        <TabsTrigger value="crypto" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Crypto</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Activity</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
