'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Resource {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function CrudPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Fetch resources
  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  // Create resource
  const createResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) throw new Error('Failed to create resource');
      
      setNewContent('');
      toast.success('Resource created successfully');
      fetchResources();
    } catch (error) {
      toast.error('Failed to create resource');
    }
  };

  // Update resource
  const updateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    try {
      const response = await fetch('/api/resources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingResource.id,
          content: editingResource.content,
        }),
      });

      if (!response.ok) throw new Error('Failed to update resource');

      setEditingResource(null);
      toast.success('Resource updated successfully');
      fetchResources();
    } catch (error) {
      toast.error('Failed to update resource');
    }
  };

  // Delete resource
  const deleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`/api/resources?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete resource');

      toast.success('Resource deleted successfully');
      fetchResources();
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Resource Management</h1>

      {/* Create Form */}
      <form onSubmit={createResource} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Enter new resource content"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </form>

      {/* Resources List */}
      <div className="grid gap-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {editingResource?.id === resource.id ? (
              <form onSubmit={updateResource} className="flex gap-2">
                <input
                  type="text"
                  value={editingResource.content}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      content: e.target.value,
                    })
                  }
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <p className="text-gray-800 mb-2">{resource.content}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <p>Created: {new Date(resource.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(resource.updatedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingResource(resource)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteResource(resource.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
