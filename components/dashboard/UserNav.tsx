import React from 'react';

const UserNav = ({ user }: { user: any }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      {/* This takes space for the menu toggle on mobile */}
      <div className="md:hidden w-10" /> {/* Invisible spacer to prevent overlap */}

      {/* User name/title */}
      <h1 className="text-lg font-semibold text-center flex-1 truncate">
        Welcome, {user?.name}
      </h1>

      {/* Placeholder to balance layout or for future buttons */}
      <div className="w-10 md:hidden" />
    </div>
  );
};

export default UserNav;
