import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

// Remove the import for CollegeApplication and define it inline
interface CollegeApplication {
  id: string;
  // Add other properties as needed
}

export const addApplication = async (userId: string, application: Omit<CollegeApplication, 'id'>) => {
  const applicationsRef = collection(db, 'users', userId, 'applications');
  await addDoc(applicationsRef, application);
};

export const updateApplication = async (userId: string, applicationId: string, application: Partial<CollegeApplication>) => {
  const applicationRef = doc(db, 'users', userId, 'applications', applicationId);
  await updateDoc(applicationRef, application);
};

export const deleteApplication = async (userId: string, applicationId: string) => {
  const applicationRef = doc(db, 'users', userId, 'applications', applicationId);
  await deleteDoc(applicationRef);
};

export const getApplications = async (userId: string): Promise<CollegeApplication[]> => {
  const applicationsRef = collection(db, 'users', userId, 'applications');
  const snapshot = await getDocs(applicationsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CollegeApplication));
};
