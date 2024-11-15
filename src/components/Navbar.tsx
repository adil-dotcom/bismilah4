import React, { useState } from 'react';
import { Bell, Menu, UserCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    ...(hasPermission('view_dashboard') ? [{
      label: 'Tableau de bord',
      path: '/',
      permission: 'view_dashboard'
    }] : []),
    { 
      label: 'Agenda', 
      path: '/appointments',
      permission: 'view_appointments'
    },
    { 
      label: 'Patients', 
      path: '/patients',
      permission: 'view_patients'
    },
    { 
      label: 'Paiement', 
      path: '/billing',
      permission: 'view_billing'
    },
    {
      label: 'Gestion Cabinet',
      submenu: [
        { 
          label: 'Documents médicaux', 
          path: '/treatments',
          permission: 'view_treatments'
        },
        { 
          label: 'Fournitures', 
          path: '/cabinet',
          permission: 'view_supplies'
        },
        { 
          label: 'Absences', 
          path: '/absences',
          permission: 'view_supplies'
        },
        { 
          label: 'Utilisateurs', 
          path: '/admin',
          permission: 'manage_users'
        },
        { 
          label: 'Listes déroulantes', 
          path: '/lists',
          permission: 'manage_users'
        },
        { 
          label: 'Sauvegarde', 
          path: '/backup',
          permission: 'manage_users'
        }
      ]
    }
  ].filter(item => {
    if (item.permission) {
      return hasPermission(item.permission);
    }
    if (item.submenu) {
      return item.submenu.some(subItem => hasPermission(subItem.permission));
    }
    return true;
  });

  return (
    <nav className="bg-white border-b border-gray-200 relative">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">
              Cabinet de Psychiatrie
            </h1>
          </div>
          
          <div className="flex items-center">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
            </button>
            <div className="ml-3 relative flex items-center space-x-4">
              <div className="flex items-center">
                <UserCircle className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user?.name} ({user?.role})
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-64 bg-white border-r border-gray-200 shadow-lg z-50">
          <div className="py-2">
            {menuItems.map((item) => {
              if (item.submenu) {
                return (
                  <div key={item.label} className="px-4 py-2">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {item.label}
                    </div>
                    <div className="pl-4">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-2 py-1 text-sm ${
                            location.pathname === subItem.path
                              ? 'text-indigo-600'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 text-sm ${
                    location.pathname === item.path
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}