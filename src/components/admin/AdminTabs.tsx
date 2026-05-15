import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, CreditCard, Wallet, History, Receipt, MessageCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadChatCount?: number;
}

export function AdminTabs({ activeTab, onTabChange, unreadChatCount = 0 }: AdminTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-8">
        <TabsTrigger value="loans" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Loans</span>
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Payments</span>
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
        <TabsTrigger 
          value="chat" 
          className={cn(
            "flex items-center gap-2 relative",
            unreadChatCount > 0 && "animate-pulse"
          )}
        >
          <MessageCircle className={cn("h-4 w-4", unreadChatCount > 0 && "text-destructive")} />
          <span className="hidden sm:inline">Chat</span>
          {unreadChatCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 min-w-5 p-0 flex items-center justify-center text-xs animate-bounce"
            >
              {unreadChatCount > 9 ? '9+' : unreadChatCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Activity</span>
        </TabsTrigger>
        <TabsTrigger value="seo" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">SEO</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}