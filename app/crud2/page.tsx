'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Resource {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Crud2Page() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch resources
  const fetchResources = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (debouncedSearch) {
        queryParams.set('search', debouncedSearch);
      }

      const response = await fetch(`/api/crud2?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      
      const { data, pagination: paginationInfo } = await response.json();
      setResources(data);
      setPagination(paginationInfo);
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  // Refetch when page or search changes
  useEffect(() => {
    fetchResources();
  }, [pagination.page, debouncedSearch]);

  // Create resource
  const createResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const response = await fetch('/api/crud2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create resource');
      }

      setNewContent('');
      toast.success('Resource created successfully');
      fetchResources();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create resource');
    }
  };

  // Update resource
  const updateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    try {
      const response = await fetch('/api/crud2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingResource.id,
          content: editingResource.content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update resource');
      }

      setEditingResource(null);
      toast.success('Resource updated successfully');
      fetchResources();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update resource');
    }
  };

  // Delete resource
  const deleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`/api/crud2?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete resource');
      }

      toast.success('Resource deleted successfully');
      fetchResources();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete resource');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Resource Management v2</h1>

      {/* Search and Create Form */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="flex-1 p-2 border rounded"
          />
        </div>

        <form onSubmit={createResource} className="flex gap-2">
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Enter new resource content"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!newContent.trim()}
          >
            Create
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Resources List */}
      {!loading && (
        <div className="space-y-4">
          {resources.length === 0 ? (
            <p className="text-center text-gray-500">No resources found</p>
          ) : (
            resources.map((resource) => (
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
                      disabled={!editingResource.content.trim()}
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
            ))
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
