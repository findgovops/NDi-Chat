"use client"

import { ReactNode } from 'react';
import { ScrollArea } from '@/features/ui/scroll-area';
import { Bot } from 'lucide-react';

// Create a Hero component similar to the Extensions page Hero
interface HeroProps {
  title: React.ReactNode;
  description: string;
  children?: React.ReactNode;
}

const Hero = ({ title, description, children }: HeroProps) => {
  return (
    <div className="border-b w-full py-16">
      <div className="container max-w-4xl h-full flex flex-col gap-16">
        <div className="flex gap-6 flex-col items-start">
          <h1 className="text-4xl font-bold flex gap-2 items-center">
            {title}
          </h1>
          <p className="text-muted-foreground max-w-xl">{description}</p>
        </div>
        {children && <div className="grid grid-cols-3 gap-2">{children}</div>}
      </div>
    </div>
  );
};

interface AgentCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  url: string;
}

const AgentCard = ({ title, description, icon, url }: AgentCardProps) => {
  const handleOpenLink = () => {
    window.open(url, '_blank');
  };

  return (
    <div 
      onClick={handleOpenLink}
      className="flex flex-col p-4 border border-input bg-background hover:bg-accent rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex gap-2 items-center text-[#07b0e8] mb-4">
        <span>{icon}</span>
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="mt-4 text-[#07b0e8] font-medium flex items-center text-sm">
        Open Agent
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

const AgentsPage = () => {
  const agents = [
    {
      title: "HR Chat Bot",
      description: "Get answers to your HR-related questions including benefits, policies, and procedures.",
      icon: <span>👤</span>,
      url: "https://netdez.sharepoint.com/:u:/r/sites/MyNDiHumanResources/SiteAssets/Copilots/MyNDi%20Human%20Resources%20Agent.agent?csf=1&web=1&e=B9jqr5"
    },
  ];

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <Hero
          title={
            <>
              <Bot size={36} strokeWidth={1.5} /> Agents
            </>
          }
          description="Access intelligent agents and chat bots to get answers and support"
        />
        <div className="container max-w-4xl py-3">
          <div className="grid grid-cols-3 gap-3">
            {agents.map((agent, index) => (
              <AgentCard
                key={index}
                title={agent.title}
                description={agent.description}
                icon={agent.icon}
                url={agent.url}
              />
            ))}
          </div>
        </div>
      </main>
    </ScrollArea>
  );
};

export default AgentsPage;
