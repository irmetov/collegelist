import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other configuration properties
};

let app;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);

export const fetchCollegeData = async () => {
  const collegesRef = db.collection('colleges');
  const snapshot = await collegesRef.get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      AvgNetPricPub: data.AvgNetPricPub,
      AvgNetPricePriv: data.AvgNetPricePriv,
      actAvg25: data.actAvg25,
      actAvg75: data.actAvg75,
      actEng25: data.actEng25,
      actEng75: data.actEng75,
      actMath25: data.actMath25,
      actMath75: data.actMath75,
      addr: data.addr,
      admRate: data.admRate,
      city: data.city,
      coa: data.coa,
      coaProgYear: data.coaProgYear,
      commonApp: data.commonApp,
      control: data.control,
      ea: data.ea,
      ed: data.ed,
      essayPolicy: data.essayPolicy,
      fee: data.fee,
      gradRate: data.gradRate,
      highDeg: data.highDeg,
      instUrl: data.instUrl,
      latitude: data.latitude,
      locale: data.locale,
      longitude: data.longtitude, // Note: Corrected spelling from 'longtitude'
      lor: data.lor,
      main: data.main,
      medEarn1yr: data.medEarn1yr,
      medEarn4y: data.medEarn4y,
      medEarn5yr: data.medEarn5yr,
      name: data.name,
      netPricePriv030: data.netPricePriv030,
      netPricePriv110plus: data.netPricePriv110plus,
      netPricePriv3048: data.netPricePriv3048,
      netPricePriv4875: data.netPricePriv4875,
      netPricePriv75110: data.netPricePriv75110,
      netPricePub030: data.netPricePub030,
      netPricePub110plus: data.netPricePub110plus,
      netPricePub3048: data.netPricePub3048,
      netPricePub4875: data.netPricePub4875,
      netPricePub75110: data.netPricePub75110,
      npcUrl: data.npcUrl,
      predDeg: data.predDeg,
      rd: data.rd,
      region: data.region,
      retRate: data.retRate,
      satAvg: data.satAvg,
      satMath25: data.satMath25,
      satMath75: data.satMath75,
      satRead25: data.satRead25,
      satRead75: data.satRead75,
      srar: data.srar,
      state: data.state,
      supEssay: data.supEssay,
      testPolicy: data.testPolicy,
      tuitIn: data.tuitIn,
      tuitOut: data.tuitOut,
      tuitProgYear: data.tuitProgYear,
      undegrSize: data.undegrSize,
      zip: data.zip,
    };
  });
};
