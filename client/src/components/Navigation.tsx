import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Brain, BarChart2, Home } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/study", icon: Brain, label: "Study" },
    { href: "/stats", icon: BarChart2, label: "Stats" }
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <div className="flex space-x-8">
            {links.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <a className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                  location === href ? "text-primary" : "text-muted-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
