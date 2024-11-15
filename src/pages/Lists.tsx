import React, { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

interface ListItem {
  id: string;
  value: string;
}

interface ListSection {
  title: string;
  key: string;
  items: ListItem[];
  storageKey: string;
}

export default function Lists() {
  const [sections, setSections] = useState<ListSection[]>([
    {
      title: 'Types de consultation',
      key: 'consultationTypes',
      items: JSON.parse(localStorage.getItem('consultationTypes') || '[]'),
      storageKey: 'consultationTypes'
    },
    {
      title: 'Sources du rendez-vous',
      key: 'appointmentSources',
      items: JSON.parse(localStorage.getItem('appointmentSources') || '[]'),
      storageKey: 'appointmentSources'
    },
    {
      title: 'Villes',
      key: 'cities',
      items: JSON.parse(localStorage.getItem('cities') || '[]'),
      storageKey: 'cities'
    },
    {
      title: 'Mutuelles',
      key: 'mutuelles',
      items: JSON.parse(localStorage.getItem('mutuelles') || '[]'),
      storageKey: 'mutuelles'
    },
    {
      title: 'Antécédents médicaux',
      key: 'medicalHistory',
      items: JSON.parse(localStorage.getItem('medicalHistory') || '[]'),
      storageKey: 'medicalHistory'
    },
    {
      title: 'Rôles utilisateur',
      key: 'userRoles',
      items: JSON.parse(localStorage.getItem('userRoles') || '[]'),
      storageKey: 'userRoles'
    }
  ]);

  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const handleAddItem = (sectionKey: string) => {
    const newValue = newItems[sectionKey]?.trim();
    if (!newValue) return;

    setSections(prevSections => {
      const updatedSections = prevSections.map(section => {
        if (section.key === sectionKey) {
          const newItem = { id: Date.now().toString(), value: newValue };
          const updatedItems = [...section.items, newItem];
          localStorage.setItem(section.storageKey, JSON.stringify(updatedItems));
          return { ...section, items: updatedItems };
        }
        return section;
      });
      return updatedSections;
    });

    setNewItems(prev => ({ ...prev, [sectionKey]: '' }));
  };

  const handleDeleteItem = (sectionKey: string, itemId: string) => {
    setSections(prevSections => {
      const updatedSections = prevSections.map(section => {
        if (section.key === sectionKey) {
          const updatedItems = section.items.filter(item => item.id !== itemId);
          localStorage.setItem(section.storageKey, JSON.stringify(updatedItems));
          return { ...section, items: updatedItems };
        }
        return section;
      });
      return updatedSections;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Listes déroulantes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map(section => (
          <div key={section.key} className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{section.title}</h3>
            
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newItems[section.key] || ''}
                onChange={(e) => setNewItems(prev => ({
                  ...prev,
                  [section.key]: e.target.value
                }))}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ajouter un élément..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem(section.key);
                  }
                }}
              />
              <button
                onClick={() => handleAddItem(section.key)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <ul className="space-y-2">
              {section.items.map(item => (
                <li 
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm text-gray-700">{item.value}</span>
                  <button
                    onClick={() => handleDeleteItem(section.key, item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}