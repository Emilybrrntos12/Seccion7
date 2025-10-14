import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { AuthProvider, FirestoreProvider, StorageProvider, useFirebaseApp } from "reactfire";

interface Props{
    children?: React.ReactNode;
}

const FirebaseService = ({children}: Props) => {
  
  const app = useFirebaseApp();

  const firestore = getFirestore(app);
    const auth = getAuth(app);
    import('firebase/auth').then(({ browserLocalPersistence, setPersistence }) => {
        setPersistence(auth, browserLocalPersistence).catch(console.error);
    });
  const storage = getStorage(app);

    return (
        <AuthProvider sdk={auth}>
            <FirestoreProvider sdk={firestore}>
                <StorageProvider sdk={storage}>
                    {children}
                </StorageProvider>
            </FirestoreProvider>
        </AuthProvider>

  )
}

export default FirebaseService