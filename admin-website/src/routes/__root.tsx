import {createRootRoute, useNavigate} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import MainLayout from '@/components/main-layout.tsx';
import * as React from 'react';

const ErrorNotFound = () => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    navigate({to: '/'}).then(() => {});
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-7xl font-extrabold text-gray-800 mb-4 drop-shadow-lg">404</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Page Not Found</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <a
        onClick={handleClick}
        className="px-6 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-black-600 transition-colors duration-200"
      >
        Go Home
      </a>
    </div>
  );
};

export const Route = createRootRoute({
  component: () => (
    <div>
      <MainLayout/>
      <TanStackRouterDevtools position={'top-right'} />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  ),
  notFoundComponent: ErrorNotFound
});