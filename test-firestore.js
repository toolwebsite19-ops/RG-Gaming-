import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';
const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);
getDocs(collection(db, 'posts')).then(snap => {
  console.log('Posts:', snap.docs.length);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
