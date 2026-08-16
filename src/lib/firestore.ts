import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// Type Definitions
// ----------------------------------------------------

export interface Car {
  id?: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  carClass: 'E' | 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X' | string;
  pi: number;
  power: number; // HP
  weight: number; // KG
  drivetrain: 'FWD' | 'RWD' | 'AWD' | string;
  status?: string;
  bestLap?: string;
  isFavorite?: boolean;
  isWatched?: boolean; // Watched in Car Price & Valuation Tracker
  priceCr?: number; // Autoshow / Market Value in Forza Credits (CR)
  rarity?: 'Autoshow' | 'Exclusive' | 'Wheelspin' | 'Barn Find' | 'Hard-to-Find' | 'DLC' | string;
  notes?: string;
  activeBuildId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface BuildUpgradeCategory {
  installed: boolean;
  name: string;
  stage?: string;
}

export interface Build {
  id?: string;
  ownerId: string;
  carId: string;
  name?: string;
  version: string;
  targetClass?: string;
  targetPI?: number;
  description: string;
  result?: string;
  upgrades?: {
    engine?: string[];
    platform?: string[];
    drivetrain?: string[];
    tires?: string[];
    aero?: string[];
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface TuneData {
  tires: {
    frontPSI: number;
    rearPSI: number;
  };
  gearing: {
    finalDrive: number;
    gear1: number;
    gear2: number;
    gear3: number;
    gear4: number;
    gear5: number;
    gear6: number;
  };
  alignment: {
    camberFront: number; // e.g. -1.5
    camberRear: number;  // e.g. -1.0
    toeFront: number;    // e.g. 0.0
    toeRear: number;     // e.g. -0.1
    caster: number;      // e.g. 6.0
  };
  antiRollBars: {
    front: number; // 1.0 - 65.0
    rear: number;
  };
  springs: {
    frontSprings: number; // kgf/mm or lb/in
    rearSprings: number;
    rideHeightFront: number; // cm
    rideHeightRear: number;
  };
  damping: {
    reboundFront: number; // 1.0 - 20.0
    reboundRear: number;
    bumpFront: number;
    bumpRear: number;
  };
  aero: {
    frontDownforce: number; // kg
    rearDownforce: number;
  };
  brake: {
    balanceFront: number; // e.g. 50%
    pressure: number;     // e.g. 100%
  };
  differential: {
    frontAccel?: number;
    frontDecel?: number;
    rearAccel: number;
    rearDecel: number;
    centerBalance?: number;
  };
}

export interface Tune {
  id?: string;
  ownerId: string;
  carId: string;
  buildId?: string;
  name: string;
  track?: string;
  values: TuneData;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface TestExperiment {
  id?: string;
  ownerId: string;
  code?: string;
  carId: string;
  carName: string;
  buildId?: string;
  buildVersion?: string;
  track?: string;
  objective: string;
  variable: string;
  beforeValue: string;
  afterValue: string;
  result?: string;
  status: 'Pending' | 'Completed' | 'Discarded';
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface KnowledgeEntry {
  id?: string;
  ownerId: string;
  subject: string;
  carName?: string;
  observation: string;
  evidence?: string;
  confidence: 'High' | 'Medium' | 'Experimental';
  tags?: string[];
  createdAt?: any;
  updatedAt?: any;
}

// ----------------------------------------------------
// Cars Collection API
// ----------------------------------------------------

export function getCarsCollection(userId: string) {
  return collection(db, `users/${userId}/cars`);
}

export async function addCar(userId: string, carData: Omit<Car, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) {
  const path = `users/${userId}/cars`;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...carData,
      isFavorite: carData.isFavorite || false,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateCar(userId: string, carId: string, carData: Partial<Car>) {
  const path = `users/${userId}/cars/${carId}`;
  try {
    const docRef = doc(db, path);
    await updateDoc(docRef, {
      ...carData,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteCar(userId: string, carId: string) {
  const path = `users/${userId}/cars/${carId}`;
  try {
    const docRef = doc(db, path);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeCars(userId: string, callback: (cars: Car[]) => void) {
  const path = `users/${userId}/cars`;
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
    callback(cars);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export function subscribeCar(userId: string, carId: string, callback: (car: Car | null) => void) {
  const path = `users/${userId}/cars/${carId}`;
  return onSnapshot(doc(db, path), (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Car);
    } else {
      callback(null);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
  });
}

// ----------------------------------------------------
// Builds Collection API
// ----------------------------------------------------

export function getBuildsCollection(userId: string, carId: string) {
  return collection(db, `users/${userId}/cars/${carId}/builds`);
}

export async function addBuild(userId: string, carId: string, buildData: Omit<Build, 'id' | 'ownerId' | 'carId' | 'createdAt' | 'updatedAt'>) {
  const path = `users/${userId}/cars/${carId}/builds`;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...buildData,
      ownerId: userId,
      carId: carId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateBuild(userId: string, carId: string, buildId: string, buildData: Partial<Build>) {
  const path = `users/${userId}/cars/${carId}/builds/${buildId}`;
  try {
    const docRef = doc(db, path);
    await updateDoc(docRef, {
      ...buildData,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteBuild(userId: string, carId: string, buildId: string) {
  const path = `users/${userId}/cars/${carId}/builds/${buildId}`;
  try {
    const docRef = doc(db, path);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeBuilds(userId: string, carId: string, callback: (builds: Build[]) => void) {
  const path = `users/${userId}/cars/${carId}/builds`;
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const builds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Build));
    callback(builds);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

// ----------------------------------------------------
// Tunes Collection API
// ----------------------------------------------------

export function defaultTuneData(drivetrain: string = 'AWD'): TuneData {
  const isAWD = drivetrain.toUpperCase() === 'AWD';
  const isFWD = drivetrain.toUpperCase() === 'FWD';
  return {
    tires: {
      frontPSI: 28.5,
      rearPSI: 28.5,
    },
    gearing: {
      finalDrive: 3.65,
      gear1: 3.10,
      gear2: 2.15,
      gear3: 1.60,
      gear4: 1.25,
      gear5: 1.00,
      gear6: 0.82,
    },
    alignment: {
      camberFront: -1.5,
      camberRear: -1.0,
      toeFront: 0.0,
      toeRear: -0.1,
      caster: 6.0,
    },
    antiRollBars: {
      front: 28.5,
      rear: 25.0,
    },
    springs: {
      frontSprings: 140.0,
      rearSprings: 120.0,
      rideHeightFront: 12.0,
      rideHeightRear: 12.5,
    },
    damping: {
      reboundFront: 10.5,
      reboundRear: 9.5,
      bumpFront: 6.5,
      bumpRear: 5.8,
    },
    aero: {
      frontDownforce: 85,
      rearDownforce: 140,
    },
    brake: {
      balanceFront: 50,
      pressure: 100,
    },
    differential: {
      frontAccel: isAWD || isFWD ? 25 : undefined,
      frontDecel: isAWD || isFWD ? 0 : undefined,
      rearAccel: isFWD ? 0 : 55,
      rearDecel: isFWD ? 0 : 20,
      centerBalance: isAWD ? 65 : undefined,
    },
  };
}

export async function saveTune(userId: string, carId: string, tune: Omit<Tune, 'id' | 'ownerId' | 'carId' | 'createdAt' | 'updatedAt'>) {
  const path = `users/${userId}/cars/${carId}/tunes`;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...tune,
      ownerId: userId,
      carId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateTune(userId: string, carId: string, tuneId: string, tuneData: Partial<Tune>) {
  const path = `users/${userId}/cars/${carId}/tunes/${tuneId}`;
  try {
    const docRef = doc(db, path);
    await updateDoc(docRef, {
      ...tuneData,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteTune(userId: string, carId: string, tuneId: string) {
  const path = `users/${userId}/cars/${carId}/tunes/${tuneId}`;
  try {
    const docRef = doc(db, path);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeTunes(userId: string, carId: string, callback: (tunes: Tune[]) => void) {
  const path = `users/${userId}/cars/${carId}/tunes`;
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const tunes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tune));
    callback(tunes);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

// ----------------------------------------------------
// Tests / Experiments Collection API
// ----------------------------------------------------

export function getTestsCollection(userId: string) {
  return collection(db, `users/${userId}/tests`);
}

export async function addTestExperiment(userId: string, testData: Omit<TestExperiment, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) {
  const path = `users/${userId}/tests`;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...testData,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateTestExperiment(userId: string, testId: string, testData: Partial<TestExperiment>) {
  const path = `users/${userId}/tests/${testId}`;
  try {
    const docRef = doc(db, path);
    await updateDoc(docRef, {
      ...testData,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteTestExperiment(userId: string, testId: string) {
  const path = `users/${userId}/tests/${testId}`;
  try {
    const docRef = doc(db, path);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeTests(userId: string, callback: (tests: TestExperiment[]) => void) {
  const path = `users/${userId}/tests`;
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const tests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestExperiment));
    callback(tests);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

// ----------------------------------------------------
// Knowledge Collection API
// ----------------------------------------------------

export function getKnowledgeCollection(userId: string) {
  return collection(db, `users/${userId}/knowledge`);
}

export async function addKnowledgeEntry(userId: string, entry: Omit<KnowledgeEntry, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) {
  const path = `users/${userId}/knowledge`;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...entry,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateKnowledgeEntry(userId: string, entryId: string, entryData: Partial<KnowledgeEntry>) {
  const path = `users/${userId}/knowledge/${entryId}`;
  try {
    const docRef = doc(db, path);
    await updateDoc(docRef, {
      ...entryData,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteKnowledgeEntry(userId: string, entryId: string) {
  const path = `users/${userId}/knowledge/${entryId}`;
  try {
    const docRef = doc(db, path);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeKnowledge(userId: string, callback: (entries: KnowledgeEntry[]) => void) {
  const path = `users/${userId}/knowledge`;
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KnowledgeEntry));
    callback(entries);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}
