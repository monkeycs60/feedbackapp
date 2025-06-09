import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleCardProps {
  role: 'creator' | 'roaster';
  isSelected: boolean;
  onSelect: (role: 'creator' | 'roaster') => void;
}

const roleConfig = {
  creator: {
    icon: "🚀",
    title: "J'ai une app à faire roaster",
    description: "Obtiens des feedbacks brutalement honnêtes",
    benefits: [
      "✓ Feedback en 24h",
      "✓ À partir de 5€",
      "✓ Roasters experts"
    ],
    buttonText: "Commencer comme Creator",
    gradient: "from-blue-500 to-purple-600"
  },
  roaster: {
    icon: "🔥",
    title: "Je veux gagner de l'argent en donnant des feedbacks", 
    description: "Monétise ton expertise, aide la communauté",
    benefits: [
      "✓ 3.50€ par feedback",
      "✓ Choisis tes missions", 
      "✓ 15-20 min de travail"
    ],
    buttonText: "Commencer comme Roaster",
    gradient: "from-orange-500 to-red-600"
  }
};

export function RoleCard({ role, isSelected, onSelect }: RoleCardProps) {
  const config = roleConfig[role];
  
  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
        isSelected ? 'ring-2 ring-orange-500 shadow-xl' : 'hover:shadow-lg'
      }`}
      onClick={() => onSelect(role)}
      data-testid={`${role}-card`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(role);
        }
      }}
      aria-label={`Sélectionner le rôle ${role}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10`} />
      
      <CardContent className="p-8 relative">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{config.icon}</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {config.title}
          </h3>
          <p className="text-gray-300">
            {config.description}
          </p>
        </div>
        
        <ul className="space-y-2 mb-6">
          {config.benefits.map((benefit, index) => (
            <li key={index} className="text-gray-200">
              {benefit}
            </li>
          ))}
        </ul>
        
        <Button 
          className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 pointer-events-none`}
          size="lg"
        >
          {config.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}