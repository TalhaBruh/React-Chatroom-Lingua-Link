import React, { useState } from "react";
import { auth, db, storage } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";

const Signup = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [profileImage, setProfileImage] = useState(null);
	const navigation = useNavigate();

	const handleSignup = async (e) => {
		e.preventDefault();
		try {
			// Create user with email and password
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);

			// Upload profile image if selected
			let profileImageUrl = "";
			if (profileImage) {
				const imageRef = ref(
					storage,
					`profile_images/${userCredential.user.uid}`
				);
				await uploadBytes(imageRef, profileImage);
				profileImageUrl = await getDownloadURL(imageRef);
			}

			// Update user profile with username and profile image URL
			await updateUserProfile(userCredential.user, username, profileImageUrl);

			// Redirect to chat room or profile page
			navigation("/");
		} catch (error) {
			console.error("Error signing up: ", error);
			toast.error(error.message);
		}
	};

	const updateUserProfile = async (user, username, profileImageUrl) => {
		try {
			await updateProfile(user, {
				displayName: username,
				photoURL: profileImageUrl,
			});

			// Update user document in Firestore with additional data if needed
			await setDoc(doc(db, "users", user.uid), {
				username,
				profileImageUrl,
			});
		} catch (error) {
			console.error("Error updating user profile: ", error);
			toast.error("Error updating user profile");
		}
	};

	const handleImageUpload = (e) => {
		const imageFile = e.target.files[0];
		setProfileImage(imageFile);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-800'>
			<div className='bg-gray-700 p-6 rounded shadow-md w-full max-w-sm'>
				<img src='favicon.png' alt='Chatify' className='w-20 mx-auto' />
				<h1 className='text-2xl font-semibold text-center mb-4 text-green-400'>
					Lingua Link
				</h1>
				<form onSubmit={handleSignup}>
					<div className='mb-4'>
						<label className='block mb-1 text-gray-400' htmlFor='username'>
							Username
						</label>
						<input
							type='text'
							id='username'
							className='w-full p-2 border border-gray-600 bg-gray-800 rounded text-gray-300'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
					</div>
					<div className='mb-4'>
						<label className='block mb-1 text-gray-400' htmlFor='email'>
							Email
						</label>
						<input
							type='email'
							id='email'
							className='w-full p-2 border border-gray-600 bg-gray-800 rounded text-gray-300'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className='mb-4'>
						<label className='block mb-1 text-gray-400' htmlFor='password'>
							Password
						</label>
						<input
							type='password'
							id='password'
							className='w-full p-2 border border-gray-600 bg-gray-800 rounded text-gray-300'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<div className='mb-4'>
						<label className='block mb-1 text-gray-400' htmlFor='profileImage'>
							Profile Image
						</label>
						<input
							type='file'
							id='profileImage'
							accept='image/*'
							className='w-full p-2 border border-gray-600 bg-gray-800 rounded text-gray-300'
							onChange={handleImageUpload}
						/>
					</div>
					<button
						className='w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center gap-x-2'
						type='submit'>
						<LogIn />
						Sign Up
					</button>
					<p className='text-center mt-4 text-gray-400'>
						Already have an account?{" "}
						<Link to='/login' className='text-green-500'>
							Log In
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
};

export default Signup;
