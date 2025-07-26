import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Trophy, Plus, Bell, Settings, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  notificationCount?: number;
}

const menuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'my-challenges', label: 'My Challenges', icon: Trophy },
  { id: 'create', label: 'Create Challenge', icon: Plus },
  { id: 'notifications', label: 'Notifications', icon: Bell, hasNotification: true },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose, activeTab, onTabChange, notificationCount = 0 }: SidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-gradient-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border lg:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">?</span>
            </div>
            <h2 className="text-lg font-bold">Menu</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showNotification = item.hasNotification && notificationCount > 0;

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 text-left transition-all duration-200",
                  isActive && "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                )}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {showNotification && (
                  <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-gradient-to-t from-background/80 to-transparent">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <div>
              <p className="font-medium text-foreground">@alice</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}