import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CreditCard, 
  Package, 
  FileText,
  UserPlus,
  Settings,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [cabinetOpen, setCabinetOpen] = useState(false);

  const menuItems = [
    ...(hasPermission('view_dashboard') ? [{
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      path: '/',
      permissions: ['view_dashboard']
    }] : []),
    { 
      icon: Calendar, 
      label: 'Agenda',
      path: '/appointments', 
      permissions: ['view_appointments']
    },
    { 
      icon: Users, 
      label: 'Patients', 
      path: '/patients', 
      permissions: ['view_patients']
    },
    { 
      icon: CreditCard, 
      label: 'Paiement', 
      path: '/billing', 
      permissions: ['view_billing']
    },
    { 
      icon: Package,
      label: 'Gestion Cabinet',
      isSubmenu: true,
      permissions: ['view_supplies'],
      submenu: [
        {
          icon: FileText,
          label: 'Documents médicaux',
          path: '/treatments',
          permissions: ['view_treatments']
        },
        {
          icon: Package,
          label: 'Fournitures',
          path: '/cabinet',
          permissions: ['view_supplies']
        },
        {
          icon: Users,
          label: 'Absences',
          path: '/absences',
          permissions: ['view_supplies']
        },
        {
          icon: UserPlus,
          label: 'Utilisateurs',
          path: '/admin',
          permissions: ['manage_users']
        },
        {
          icon: Settings,
          label: 'Listes déroulantes',
          path: '/lists',
          permissions: ['manage_users']
        },
        {
          icon: Save,
          label: 'Sauvegarde',
          path: '/backup',
          permissions: ['manage_users']
        }
      ]
    }
  ].filter(item => {
    if (item.permissions) {
      return item.permissions.some(permission => hasPermission(permission));
    }
    if (item.submenu) {
      return item.submenu.some(subItem => 
        subItem.permissions.some(permission => hasPermission(permission))
      );
    }
    return true;
  });

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            if (item.isSubmenu) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setCabinetOpen(!cabinetOpen)}
                    className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      location.pathname.startsWith('/cabinet') ||
                      location.pathname === '/treatments' ||
                      location.pathname === '/admin'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        location.pathname.startsWith('/cabinet') ||
                        location.pathname === '/treatments' ||
                        location.pathname === '/admin'
                          ? 'text-indigo-700'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.label}
                  </button>
                  
                  {cabinetOpen && item.submenu && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isActive = location.pathname === subItem.path;
                        
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                              isActive
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <SubIcon
                              className={`mr-3 h-5 w-5 ${
                                isActive
                                  ? 'text-indigo-700'
                                  : 'text-gray-400 group-hover:text-gray-500'
                              }`}
                            />
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    isActive
                      ? 'text-indigo-700'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}