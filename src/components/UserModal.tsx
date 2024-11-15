import React, { useState } from 'react';
import { X, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
  initialData?: any;
}

export default function UserModal({ isOpen, onClose, onSubmit, initialData }: UserModalProps) {
  const { hasPermission } = useAuth();
  const [userData, setUserData] = useState({
    username: initialData?.username || '',
    password: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    name: initialData?.name || '',
    role: initialData?.role || 'secretaire',
    customRole: '',
    specialite: initialData?.specialite || ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [savedRoles, setSavedRoles] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedRoles');
    return saved ? JSON.parse(saved) : ['admin', 'docteur', 'secretaire'];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isChangingPassword) {
      if (userData.newPassword !== userData.confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }
      onSubmit({
        ...userData,
        password: userData.newPassword
      });
    } else {
      // Sauvegarder le rôle personnalisé s'il est nouveau
      if (userData.customRole && !savedRoles.includes(userData.customRole)) {
        const newRoles = [...savedRoles, userData.customRole];
        setSavedRoles(newRoles);
        localStorage.setItem('savedRoles', JSON.stringify(newRoles));
      }

      onSubmit({
        ...userData,
        role: userData.customRole || userData.role
      });
    }

    setUserData({
      username: '',
      password: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      name: '',
      role: 'secretaire',
      customRole: '',
      specialite: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Nom complet
              </div>
            </label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Nom d'utilisateur
              </div>
            </label>
            <input
              type="text"
              value={userData.username}
              onChange={(e) => setUserData({...userData, username: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          {!initialData ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Mot de passe
                </div>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={userData.password}
                  onChange={(e) => setUserData({...userData, password: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Changer le mot de passe</span>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  {isChangingPassword ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              {isChangingPassword && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Mot de passe actuel
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={userData.currentPassword}
                        onChange={(e) => setUserData({...userData, currentPassword: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Nouveau mot de passe
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={userData.newPassword}
                        onChange={(e) => setUserData({...userData, newPassword: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Confirmer le nouveau mot de passe
                      </div>
                    </label>
                    <input
                      type="password"
                      value={userData.confirmPassword}
                      onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <div className="flex space-x-2">
              <select
                value={userData.role}
                onChange={(e) => setUserData({...userData, role: e.target.value})}
                className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {savedRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <input
                type="text"
                value={userData.customRole}
                onChange={(e) => setUserData({...userData, customRole: e.target.value})}
                className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Ou saisir un nouveau rôle..."
              />
            </div>
          </div>

          {(userData.role === 'docteur' || userData.customRole?.toLowerCase().includes('docteur') || userData.customRole?.toLowerCase().includes('médecin')) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Spécialité</label>
              <input
                type="text"
                value={userData.specialite}
                onChange={(e) => setUserData({...userData, specialite: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
                placeholder="Ex: Psychiatre, Psychologue..."
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {initialData ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}