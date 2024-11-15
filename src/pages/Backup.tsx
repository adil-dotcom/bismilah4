import React from 'react';
import { Download, Upload, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Backup() {
  const { exporterDonnees, importerDonnees, reinitialiserDonnees } = useData();
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importerDonnees(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sauvegarde</h2>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <button
            onClick={exporterDonnees}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Sauvegarder les infos
          </button>

          <label className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
            <Upload className="h-5 w-5 mr-2" />
            Importer les infos
            <input
              type="file"
              onChange={handleImport}
              className="hidden"
              accept=".json"
            />
          </label>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Réinitialiser
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer la réinitialisation
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  reinitialiserDonnees();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}