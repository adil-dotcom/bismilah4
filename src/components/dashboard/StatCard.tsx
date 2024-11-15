import React, { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  iconBgColor: string;
  title: string;
  children: ReactNode;
}

export default function StatCard({ icon, iconBgColor, title, children }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`${iconBgColor} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-full">
            <p className="text-sm font-medium text-gray-500 truncate">
              {title}
            </p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}