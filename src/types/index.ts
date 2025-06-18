export interface Part {
  id: string;
  partNumber: string;
  runningNumber: string;
  partName: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  supplierId: string;
  name: string;
  gstNumber: string;
  contactNumber: string;
  address: string;
  createdAt: Date;
}

export interface Company {
  id: string;
  companyId: string;
  companyName: string;
  gstNumber: string;
  contactNumber: string;
  address: string;
  supplierId: string;
  createdAt: Date;
}

export interface SMWToSupplierTransaction {
  id: string;
  date: Date;
  supplierId: string;
  partId: string;
  dcNumber: string;
  sendQuantity: number;
  createdAt: Date;
}

export interface SupplierToCompanyTransaction {
  id: string;
  date: Date;
  companyId: string;
  partId: string;
  sendQuantity: number;
  supplierId: string;
  createdAt: Date;
}

export interface StockLedgerEntry {
  partNumber: string;
  partName: string;
  runningNumber: string;
  dcNumber: string;
  totalSentToSupplier: number;
  totalSentToCompany: number;
  availableQuantity: number;
  supplierName: string;
  companyName?: string;
}

export interface FilterOptions {
  supplier?: string;
  company?: string;
  part?: string;
  dateFrom?: Date;
  dateTo?: Date;
  dcNumber?: string;
}