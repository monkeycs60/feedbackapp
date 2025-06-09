export const metadata = {
  title: "Dashboard Creator - RoastMyApp",
  description: "Gérez vos demandes de roast et vos feedbacks"
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Dashboard Creator
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Bienvenue sur ton dashboard !
          </h2>
          <p className="text-gray-300">
            Ici tu pourras bientôt :
          </p>
          <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
            <li>Poster tes apps à faire roaster</li>
            <li>Gérer tes demandes en cours</li>
            <li>Consulter tes feedbacks reçus</li>
            <li>Voir tes statistiques</li>
          </ul>
          
          <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-orange-300">
              🚧 Dashboard en cours de développement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}