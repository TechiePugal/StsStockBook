import { useState, useEffect } from 'react';
import {
  Part,
  Supplier,
  Company,
  SMWToSupplierTransaction,
  SupplierToCompanyTransaction,
} from '../types';
import {
  partsService,
  suppliersService,
  companiesService,
  smwToSupplierService,
  supplierToCompanyService,
} from '../services/firebaseService';

export const useInventoryData = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [smwToSupplierTransactions, setSmwToSupplierTransactions] = useState<SMWToSupplierTransaction[]>([]);
  const [supplierToCompanyTransactions, setSupplierToCompanyTransactions] = useState<SupplierToCompanyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [partsData, suppliersData, companiesData, smwData, supplierData] = await Promise.all([
        partsService.getAll(),
        suppliersService.getAll(),
        companiesService.getAll(),
        smwToSupplierService.getAll(),
        supplierToCompanyService.getAll(),
      ]);

      setParts(partsData);
      setSuppliers(suppliersData);
      setCompanies(companiesData);
      setSmwToSupplierTransactions(smwData);
      setSupplierToCompanyTransactions(supplierData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    parts,
    suppliers,
    companies,
    smwToSupplierTransactions,
    supplierToCompanyTransactions,
    loading,
    refreshData: loadData,
  };
};