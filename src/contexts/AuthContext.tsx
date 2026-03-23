import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userRole: 'admin' | 'user' | null;
  userStatus: 'pending' | 'approved' | 'rejected' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userStatus: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userStatus, setUserStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }

      if (user) {
        unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role as 'admin' | 'user');
            setUserStatus(data.status || 'approved');
          } else {
            // Default role or check if it's the default admin
            if (user.email === 'gyantid830@gmail.com') {
              setUserRole('admin');
              setUserStatus('approved');
            } else {
              setUserRole('user');
              setUserStatus('approved');
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user role:", error);
          setUserRole('user');
          setUserStatus('approved');
          setLoading(false);
        });
      } else {
        setUserRole(null);
        setUserStatus(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, userStatus, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
