import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ChatRooms from "./components/ChatRooms";

const PrivateRoute = ({ element }) => {
	const { currentUser } = useAuth();

	return currentUser ? element : <Navigate to='/login' replace />;
};

const AuthRoute = ({ element }) => {
	const { currentUser } = useAuth();

	return currentUser ? <Navigate to='/' replace /> : element;
};

const App = () => {
	const [isSmallScreen, setIsSmallScreen] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsSmallScreen(window.innerWidth < 768);
		};

		// Set initial screen size
		handleResize();

		// Add resize event listener
		window.addEventListener("resize", handleResize);

		// Remove event listener on component unmount
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<AuthProvider>
			<Router>
				{isSmallScreen ? (
					<div className='flex items-center justify-center h-screen text-center bg-gray-800 font-semibold px-5'>
						<p className='text-white bg-red-500 p-4 rounded'>
							This app is not supported on small screens. Please use a device
							with a larger screen size.
						</p>
					</div>
				) : (
					<Routes>
						<Route path='/login' element={<AuthRoute element={<Login />} />} />
						<Route
							path='/signup'
							element={<AuthRoute element={<Signup />} />}
						/>
						<Route
							path='/'
							element={<PrivateRoute element={<ChatRooms />} />}
						/>
					</Routes>
				)}
			</Router>

			<ToastContainer position='bottom-right' autoClose={3000} />
		</AuthProvider>
	);
};

export default App;
