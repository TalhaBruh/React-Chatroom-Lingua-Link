import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user);
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	// Add a useEffect hook to fetch all users from the database and set their name and profile picture in the state
	useEffect(() => {
		const fetchUsers = async () => {
			const usersCollection = collection(db, "users");
			const usersSnapshot = await getDocs(usersCollection);
			usersSnapshot.forEach((doc) => {
				users[doc.id] = {
					id: doc.id,
					username: doc.data().username,
					profileImageUrl: doc.data().profileImageUrl,
				};
			});
			setUsers(users);
		};
		fetchUsers();
	}, []);

	const value = {
		currentUser,
		users,
		setUsers,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};
