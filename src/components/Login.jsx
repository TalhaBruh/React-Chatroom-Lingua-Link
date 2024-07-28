import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { LogIn } from "lucide-react";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigation = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await signInWithEmailAndPassword(auth, email, password);
			navigation("/");
		} catch (error) {
			console.error("Error logging in: ", error);
			toast.error(error.message);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-800'>
			<div className='bg-gray-700 p-6 rounded shadow-md w-full max-w-sm'>
				<img src='favicon.png' alt='Chatify' className='w-20 mx-auto' />
				<h1 className='text-2xl font-semibold text-center mb-4 text-green-400'>
					Lingua Link
				</h1>
				<form onSubmit={handleLogin}>
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
					<button
						className='w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2'
						type='submit'>
						<LogIn /> Login
					</button>
					<p className='text-center mt-4 text-gray-400'>
						Don't have an account?{" "}
						<Link to='/signup' className='text-green-500'>
							Sign Up
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
};

export default Login;
