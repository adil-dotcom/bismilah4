import React, { useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserModal from '../components/UserModal';
import PasswordManagementModal from '../components/PasswordManagementModal';
import BlockUserConfirmModal from '../components/BlockUserConfirmModal';
import { testUsers } from '../data/testData';

export default function AdminPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isBlockConfirmModalOpen, setIsBlockConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [blockAction, setBlockAction] = useState<'block' | 'unblock'>('block');
  const { hasPermission, resetFailedAttempts, blockUser, unblockUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(testUsers);

  const handleAddUser = (userData: any) => {
    const newUser = {
      id: crypto.randomUUID(),
      ...userData,
      dateCreation: new Date().toLocaleDateString('fr-FR'),
      failedAttempts: 0,
      isBlocked: false
    };
    setUsers([...users, newUser]);
    setIsModalOpen(false);
  };

  const handlePasswordManagement = (user: any) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleBlockToggle = (userId: string, currentlyBlocked: boolean) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setBlockAction(currentlyBlocked ? 'unblock' : 'block');
      setIsBlockConfirmModalOpen(true);
    }
  };

  const handleBlockConfirm = () => {
    if (selectedUser) {
      if (blockAction === 'block') {
        blockUser(selectedUser.id);
      } else {
        unblockUser(selectedUser.id);
      }
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, isBlocked: blockAction === 'block' } : user
      ));
      setIsBlockConfirmModalOpen(false);
    }
  };

  const handleResetAttempts = (userId: string) => {
    resetFailedAttempts(userId);
    setUsers(users.map(user => 
      user.id === userId ? { ...user, failedAttempts: 0, isBlocked: false } : user
    ));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Nouvel utilisateur
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Rechercher un utilisateur..."
            />
          </div>
        </div>

        {/* Table content remains the same */}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddUser}
      />

      <PasswordManagementModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <BlockUserConfirmModal
        isOpen={isBlockConfirmModalOpen}
        onClose={() => {
          setIsBlockConfirmModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleBlockConfirm}
        userName={selectedUser?.name || ''}
        action={blockAction}
      />
    </div>
  );
}