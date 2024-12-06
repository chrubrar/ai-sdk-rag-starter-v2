'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';

interface Resource {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function DrizzleQuery() {
  const [data, setData] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/drizzleqry');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Resources</h1>
      <div className="grid gap-4">
        {data.map((resource) => (
          <div
            key={resource.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <p className="text-gray-600 mb-2">ID: {resource.id}</p>
            <p className="text-gray-800">{resource.content}</p>
            <div className="mt-2 text-sm text-gray-500">
              <p>Created: {new Date(resource.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(resource.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
