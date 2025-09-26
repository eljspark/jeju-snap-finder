import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.ssr'

// This file is only used for development preview
// SSG production uses vite-plugin-ssr rendering
if (typeof window !== 'undefined') {
  const DevApp = () => {
    const [packages, setPackages] = useState([]);
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadData = async () => {
        try {
          // Load packages data
          const packagesResponse = await fetch('/data/packages.json');
          const packagesData = await packagesResponse.json();
          setPackages(packagesData);

          // Check if we're on a package detail route
          const path = window.location.pathname;
          const packageMatch = path.match(/^\/packages\/(.+)$/);
          
          if (packageMatch) {
            const packageId = packageMatch[1];
            try {
              const packageResponse = await fetch(`/data/package-${packageId}.json`);
              const packageDetailData = await packageResponse.json();
              setPackageData(packageDetailData);
            } catch (error) {
              console.error('Failed to load package data:', error);
            }
          }
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, []);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          </div>
        </div>
      );
    }

    return <App packages={packages} packageData={packageData} />;
  };
  
  createRoot(document.getElementById("root")!).render(<DevApp />);
}
