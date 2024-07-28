import React, { useState } from "react";
import { toast } from "react-toastify";
import { updateProfile } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";
import {
	ref,
	deleteObject,
	uploadBytes,
	getDownloadURL,
} from "firebase/storage";
import { storage, db } from "../firebase";

const ProfileSettingsPopup = ({
	user,
	username,
	setUsername,
	profileImage,
	setProfileImage,
	onClose,
}) => {
	const [newUsername, setNewUsername] = useState(username);
	const [newProfileImage, setNewProfileImage] = useState(null);

	const handleSave = async () => {
		try {
			// Update username
			await updateProfile(user, { displayName: newUsername });
			const userDocRef = doc(db, "users", user.uid);
			await updateDoc(userDocRef, { username: newUsername });
			setUsername(newUsername);

			// If a new profile image is selected, upload it
			if (newProfileImage) {
				const storageRef = ref(storage, `profile_images/${user.uid}`);

				// Upload new image
				await uploadBytes(storageRef, newProfileImage);
				const profileImageUrl = await getDownloadURL(storageRef);
				await updateDoc(userDocRef, { profileImageUrl });

				// Update user profile with new image URL
				await updateProfile(user, { photoURL: profileImageUrl });

				// Update the profile image in the state
				setProfileImage(profileImageUrl);

				// Clear the new profile image state
				setNewProfileImage(null);
			}

			toast.success("Profile updated successfully");
			onClose();
		} catch (error) {
			console.error("Error updating profile: ", error);
			toast.error("Error updating profile");
		}
	};

	return (
		<div className='fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50'>
			<div className='bg-gray-800 p-6 rounded shadow-md max-w-md w-full'>
				<h2 className='text-2xl mb-4 text-green-500'>Profile Settings</h2>
				<div className='mb-4 flex flex-col items-center gap-4'>
					<input
						type='file'
						id='newProfileImage'
						className='hidden'
						onChange={(e) => setNewProfileImage(e.target.files[0])}
					/>
					<img
						src={
							newProfileImage
								? URL.createObjectURL(newProfileImage)
								: profileImage
						}
						alt='Profile'
						className='w-32 h-32 rounded-full object-cover cursor-pointer'
						onClick={() => document.getElementById("newProfileImage").click()}
					/>
				</div>
				<div className='mb-4'>
					<label htmlFor='newUsername' className='block mb-1 text-gray-400'>
						Username
					</label>
					<input
						type='text'
						id='newUsername'
						className='w-full p-2 border border-gray-300 rounded bg-gray-700 text-gray-300'
						value={newUsername}
						onChange={(e) => setNewUsername(e.target.value)}
					/>
				</div>
				<div className='flex justify-between'>
					<button
						onClick={handleSave}
						className='bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600'>
						Save
					</button>
					<button
						onClick={onClose}
						className='bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600'>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProfileSettingsPopup;
