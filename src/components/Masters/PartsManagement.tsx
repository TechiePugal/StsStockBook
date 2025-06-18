import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Part } from '../../types';
import { partsService } from '../../services/firebaseService';
import { useInventoryData } from '../../hooks/useInventoryData';
import Modal from '../Common/Modal';

interface PartsFormData {
  partNumber: string;
  runningNumber: string;
  partName: string;
}

const PartsManagement: React.FC<ReturnType<typeof useInventoryData>> = ({
  parts,
  loading,
  refreshData
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PartsFormData>();

  const filteredParts = parts.filter(part =>
    part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.runningNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: PartsFormData) => {
    setSubmitting(true);
    try {
      if (editingPart) {
        await partsService.update(editingPart.id, data);
        toast.success('Part updated successfully');
      } else {
        await partsService.create(data);
        toast.success('Part created successfully');
      }
      reset();
      setShowModal(false);
      setEditingPart(null);
      refreshData();
    } catch (error) {
      toast.error('Error saving part');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    reset({
      partNumber: part.partNumber,
      runningNumber: part.runningNumber,
      partName: part.partName,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await partsService.delete(id);
        toast.success('Part deleted successfully');
        refreshData();
      } catch (error) {
        toast.error('Error deleting part');
        console.error(error);
      }
    }
  };

  const handleAddNew = () => {
    setEditingPart(null);
    reset();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your inventory parts and components
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Part
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search parts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Running Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParts.map((part) => (
                <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {part.partNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {part.runningNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {part.partName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {part.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(part)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(part.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredParts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No parts found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPart(null);
          reset();
        }}
        title={editingPart ? 'Edit Part' : 'Add New Part'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Part Number
            </label>
            <input
              {...register('partNumber', { required: 'Part number is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter part number"
            />
            {errors.partNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.partNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Running Number
            </label>
            <input
              {...register('runningNumber', { required: 'Running number is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter running number"
            />
            {errors.runningNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.runningNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Part Name
            </label>
            <input
              {...register('partName', { required: 'Part name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter part name"
            />
            {errors.partName && (
              <p className="text-red-500 text-xs mt-1">{errors.partName.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingPart(null);
                reset();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200"
            >
              {submitting ? 'Saving...' : editingPart ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PartsManagement;