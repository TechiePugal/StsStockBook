import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { SMWToSupplierTransaction } from '../../types';
import { smwToSupplierService } from '../../services/firebaseService';
import { useInventoryData } from '../../hooks/useInventoryData';
import Modal from '../Common/Modal';

interface SMWToSupplierFormData {
  date: string;
  supplierId: string;
  partId: string;
  dcNumber: string;
  sendQuantity: number;
}

interface Filters {
  supplier: string;
  part: string;
  dcNumber: string;
  dateFrom: string;
  dateTo: string;
}

const SMWToSupplier: React.FC<ReturnType<typeof useInventoryData>> = ({
  smwToSupplierTransactions,
  suppliers,
  parts,
  loading,
  refreshData
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    supplier: '',
    part: '',
    dcNumber: '',
    dateFrom: '',
    dateTo: ''
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<SMWToSupplierFormData>();
  const selectedPartId = watch('partId');

  const filteredTransactions = smwToSupplierTransactions.filter(transaction => {
    const matchesSupplier = !filters.supplier || transaction.supplierId === filters.supplier;
    const matchesPart = !filters.part || transaction.partId === filters.part;
    const matchesDC = !filters.dcNumber || transaction.dcNumber.toLowerCase().includes(filters.dcNumber.toLowerCase());
    const matchesDateFrom = !filters.dateFrom || transaction.date >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || transaction.date <= new Date(filters.dateTo);
    
    return matchesSupplier && matchesPart && matchesDC && matchesDateFrom && matchesDateTo;
  });

  const onSubmit = async (data: SMWToSupplierFormData) => {
    setSubmitting(true);
    try {
      await smwToSupplierService.create({
        ...data,
        date: new Date(data.date),
        sendQuantity: Number(data.sendQuantity)
      });
      toast.success('Transaction created successfully');
      reset();
      setShowModal(false);
      refreshData();
    } catch (error) {
      toast.error('Error creating transaction');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  const getPartInfo = (partId: string) => {
    const part = parts.find(p => p.id === partId);
    return part ? `${part.partNumber} - ${part.partName}` : 'Unknown Part';
  };

  const getSelectedPartName = () => {
    if (!selectedPartId) return '';
    const part = parts.find(p => p.id === selectedPartId);
    return part?.partName || '';
  };

  const clearFilters = () => {
    setFilters({
      supplier: '',
      part: '',
      dcNumber: '',
      dateFrom: '',
      dateTo: ''
    });
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
          <h1 className="text-2xl font-bold text-gray-900">SMW to Supplier Transactions</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track parts sent from SMW to suppliers
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select
                value={filters.supplier}
                onChange={(e) => setFilters({...filters, supplier: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part</label>
              <select
                value={filters.part}
                onChange={(e) => setFilters({...filters, part: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Parts</option>
                {parts.map(part => (
                  <option key={part.id} value={part.id}>{part.partNumber} - {part.partName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DC Number</label>
              <input
                type="text"
                value={filters.dcNumber}
                onChange={(e) => setFilters({...filters, dcNumber: e.target.value})}
                placeholder="Search DC number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DC Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getSupplierName(transaction.supplierId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getPartInfo(transaction.partId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.dcNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {transaction.sendQuantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          reset();
        }}
        title="New SMW to Supplier Transaction"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <select
                {...register('supplierId', { required: 'Supplier is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.supplierId})
                  </option>
                ))}
              </select>
              {errors.supplierId && (
                <p className="text-red-500 text-xs mt-1">{errors.supplierId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part
              </label>
              <select
                {...register('partId', { required: 'Part is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a part</option>
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.partNumber} - {part.partName}
                  </option>
                ))}
              </select>
              {errors.partId && (
                <p className="text-red-500 text-xs mt-1">{errors.partId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Name (Auto-filled)
              </label>
              <input
                type="text"
                value={getSelectedPartName()}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                placeholder="Part name will appear here"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DC Number
              </label>
              <input
                {...register('dcNumber', { required: 'DC number is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter DC number"
              />
              {errors.dcNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.dcNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send Quantity
              </label>
              <input
                type="number"
                min="1"
                {...register('sendQuantity', { 
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Quantity must be at least 1' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quantity"
              />
              {errors.sendQuantity && (
                <p className="text-red-500 text-xs mt-1">{errors.sendQuantity.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
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
              {submitting ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SMWToSupplier;