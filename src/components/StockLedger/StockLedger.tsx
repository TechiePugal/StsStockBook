import React, { useState, useMemo } from 'react';
import { Download, Filter, FileText, Sheet, Package } from 'lucide-react';
import { useInventoryData } from '../../hooks/useInventoryData';
import { StockLedgerEntry, FilterOptions } from '../../types';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

const StockLedger: React.FC<ReturnType<typeof useInventoryData>> = ({
  parts,
  suppliers,
  companies,
  smwToSupplierTransactions,
  supplierToCompanyTransactions,
  loading
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    supplier: '',
    company: '',
    part: '',
    dcNumber: '',
    dateFrom: undefined,
    dateTo: undefined
  });

  const stockLedgerData = useMemo(() => {
    const ledgerMap = new Map<string, StockLedgerEntry>();

    // Process SMW to Supplier transactions
    smwToSupplierTransactions.forEach(transaction => {
      const key = `${transaction.supplierId}-${transaction.partId}`;
      const part = parts.find(p => p.id === transaction.partId);
      const supplier = suppliers.find(s => s.id === transaction.supplierId);

      if (!part || !supplier) return;

      if (!ledgerMap.has(key)) {
        ledgerMap.set(key, {
          partNumber: part.partNumber,
          partName: part.partName,
          runningNumber: part.runningNumber,
          dcNumber: transaction.dcNumber,
          totalSentToSupplier: 0,
          totalSentToCompany: 0,
          availableQuantity: 0,
          supplierName: supplier.name,
          companyName: undefined
        });
      }

      const entry = ledgerMap.get(key)!;
      entry.totalSentToSupplier += transaction.sendQuantity;
      entry.dcNumber = transaction.dcNumber; // Use the latest DC number
    });

    // Process Supplier to Company transactions
    supplierToCompanyTransactions.forEach(transaction => {
      const key = `${transaction.supplierId}-${transaction.partId}`;
      const company = companies.find(c => c.id === transaction.companyId);

      if (!company || !ledgerMap.has(key)) return;

      const entry = ledgerMap.get(key)!;
      entry.totalSentToCompany += transaction.sendQuantity;
      entry.companyName = company.companyName;
    });

    // Calculate available quantities
    ledgerMap.forEach(entry => {
      entry.availableQuantity = entry.totalSentToSupplier - entry.totalSentToCompany;
    });

    return Array.from(ledgerMap.values());
  }, [parts, suppliers, companies, smwToSupplierTransactions, supplierToCompanyTransactions]);

  const filteredData = useMemo(() => {
    return stockLedgerData.filter(entry => {
      const matchesSupplier = !filters.supplier || entry.supplierName.toLowerCase().includes(filters.supplier.toLowerCase());
      const matchesCompany = !filters.company || (entry.companyName && entry.companyName.toLowerCase().includes(filters.company.toLowerCase()));
      const matchesPart = !filters.part || entry.partNumber.toLowerCase().includes(filters.part.toLowerCase()) || entry.partName.toLowerCase().includes(filters.part.toLowerCase());
      const matchesDC = !filters.dcNumber || entry.dcNumber.toLowerCase().includes(filters.dcNumber.toLowerCase());

      return matchesSupplier && matchesCompany && matchesPart && matchesDC;
    });
  }, [stockLedgerData, filters]);

  const handleExportExcel = () => {
    try {
      const exportData = filteredData.map(entry => ({
        'Part Number': entry.partNumber,
        'Part Name': entry.partName,
        'Running Number': entry.runningNumber,
        'DC Number': entry.dcNumber,
        'Total Sent to Supplier': entry.totalSentToSupplier,
        'Total Sent to Company': entry.totalSentToCompany,
        'Available Quantity': entry.availableQuantity,
        'Supplier': entry.supplierName,
        'Company': entry.companyName || '-'
      }));

      exportToExcel(exportData, 'stock-ledger', 'Stock Ledger');
      toast.success('Excel file exported successfully');
    } catch (error) {
      toast.error('Error exporting Excel file');
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredData, 'stock-ledger', 'Stock Ledger Report');
      toast.success('PDF file exported successfully');
    } catch (error) {
      toast.error('Error exporting PDF file');
      console.error(error);
    }
  };

  const clearFilters = () => {
    setFilters({
      supplier: '',
      company: '',
      part: '',
      dcNumber: '',
      dateFrom: undefined,
      dateTo: undefined
    });
  };

  const totalStats = useMemo(() => {
    return filteredData.reduce((acc, entry) => ({
      totalSentToSupplier: acc.totalSentToSupplier + entry.totalSentToSupplier,
      totalSentToCompany: acc.totalSentToCompany + entry.totalSentToCompany,
      totalAvailable: acc.totalAvailable + entry.availableQuantity
    }), {
      totalSentToSupplier: 0,
      totalSentToCompany: 0,
      totalAvailable: 0
    });
  }, [filteredData]);

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
          <h1 className="text-2xl font-bold text-gray-900">Stock Ledger</h1>
          <p className="mt-2 text-sm text-gray-600">
            Dynamic view of stock movements and available quantities
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Sheet className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sent to Suppliers</p>
              <p className="text-2xl font-semibold text-gray-900">{totalStats.totalSentToSupplier}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sent to Companies</p>
              <p className="text-2xl font-semibold text-gray-900">{totalStats.totalSentToCompany}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Available</p>
              <p className="text-2xl font-semibold text-gray-900">{totalStats.totalAvailable}</p>
            </div>
          </div>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <input
                type="text"
                value={filters.supplier}
                onChange={(e) => setFilters({...filters, supplier: e.target.value})}
                placeholder="Search supplier..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => setFilters({...filters, company: e.target.value})}
                placeholder="Search company..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part</label>
              <input
                type="text"
                value={filters.part}
                onChange={(e) => setFilters({...filters, part: e.target.value})}
                placeholder="Search part..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
          </div>
        )}
      </div>

      {/* Stock Ledger Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Running Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DC Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent to Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent to Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.partNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.partName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.runningNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.dcNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {entry.totalSentToSupplier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {entry.totalSentToCompany}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      entry.availableQuantity > 0 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.availableQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.supplierName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.companyName || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No stock ledger entries found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockLedger;