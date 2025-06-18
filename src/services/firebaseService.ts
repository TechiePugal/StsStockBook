import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Part,
  Supplier,
  Company,
  SMWToSupplierTransaction,
  SupplierToCompanyTransaction,
} from '../types';

// Parts Service
export const partsService = {
  async create(part: Omit<Part, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, 'parts'), {
      ...part,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getAll(): Promise<Part[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'parts'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Part[];
  },

  async update(id: string, data: Partial<Part>) {
    await updateDoc(doc(db, 'parts', id), data);
  },

  async delete(id: string) {
    await deleteDoc(doc(db, 'parts', id));
  },
};

// Suppliers Service
export const suppliersService = {
  async create(supplier: Omit<Supplier, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, 'suppliers'), {
      ...supplier,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getAll(): Promise<Supplier[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'suppliers'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Supplier[];
  },

  async update(id: string, data: Partial<Supplier>) {
    await updateDoc(doc(db, 'suppliers', id), data);
  },

  async delete(id: string) {
    await deleteDoc(doc(db, 'suppliers', id));
  },
};

// Companies Service
export const companiesService = {
  async create(company: Omit<Company, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, 'companies'), {
      ...company,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getAll(): Promise<Company[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'companies'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Company[];
  },

  async getBySupplier(supplierId: string): Promise<Company[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'companies'),
        where('supplierId', '==', supplierId),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Company[];
  },

  async update(id: string, data: Partial<Company>) {
    await updateDoc(doc(db, 'companies', id), data);
  },

  async delete(id: string) {
    await deleteDoc(doc(db, 'companies', id));
  },
};

// SMW to Supplier Transactions Service
export const smwToSupplierService = {
  async create(transaction: Omit<SMWToSupplierTransaction, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, 'smwToSupplier'), {
      ...transaction,
      date: Timestamp.fromDate(transaction.date),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getAll(): Promise<SMWToSupplierTransaction[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'smwToSupplier'), orderBy('date', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as SMWToSupplierTransaction[];
  },
};

// Supplier to Company Transactions Service
export const supplierToCompanyService = {
  async create(transaction: Omit<SupplierToCompanyTransaction, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, 'supplierToCompany'), {
      ...transaction,
      date: Timestamp.fromDate(transaction.date),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getAll(): Promise<SupplierToCompanyTransaction[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'supplierToCompany'), orderBy('date', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as SupplierToCompanyTransaction[];
  },
};