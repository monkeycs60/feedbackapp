export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-400 text-lg">Chargement...</p>
        </div>
      </div>
    </div>
  );
}