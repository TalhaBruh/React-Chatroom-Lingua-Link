import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
	doc,
	onSnapshot,
	collection,
	addDoc,
	setDoc,
	arrayUnion,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import ChatRoom from "./ChatRoom";
import { useAuth } from "../context/AuthContext";
import { UsersRound, Search, Power, Settings } from "lucide-react";
import ProfileSettingsPopup from "./ProfileSettingsPopup"; // Import the ProfileSettingsPopup component

const ChatRooms = () => {
	const [roomName, setRoomName] = useState("");
	const [rooms, setRooms] = useState([]);
	const [joinedRooms, setJoinedRooms] = useState([]);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [profileSettingsOpen, setProfileSettingsOpen] = useState(false); // State for controlling the visibility of the profile settings popup
	const { currentUser, users, setUsers } = useAuth();

	useEffect(() => {
		const unsubscribeRooms = onSnapshot(
			collection(db, "chatRooms"),
			(snapshot) => {
				const roomsData = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setRooms(roomsData);
			}
		);

		const unsubscribeUser = onSnapshot(
			doc(db, "users", auth.currentUser.uid),
			(doc) => {
				if (doc.exists()) {
					setJoinedRooms(doc.data().joinedRooms || []);
				}
			}
		);

		return () => {
			unsubscribeRooms();
			unsubscribeUser();
		};
	}, []);

	const handleCreateRoom = async (e) => {
		e.preventDefault();
		try {
			const docRef = await addDoc(collection(db, "chatRooms"), {
				name: roomName,
				ownerId: auth.currentUser.uid,
				joinedUsers: [auth.currentUser.uid],
				createdAt: new Date(),
			});
			await setDoc(
				doc(db, "users", auth.currentUser.uid),
				{ joinedRooms: arrayUnion(docRef.id) },
				{ merge: true }
			);
			setRoomName("");
			toast.success("Room created successfully");
		} catch (error) {
			toast.error("Error creating room");
		}
	};

	const handleJoinRoom = async (roomId) => {
		try {
			await setDoc(
				doc(db, "chatRooms", roomId),
				{ joinedUsers: arrayUnion(auth.currentUser.uid) },
				{ merge: true }
			);

			await setDoc(
				doc(db, "users", auth.currentUser.uid),
				{ joinedRooms: arrayUnion(roomId) },
				{ merge: true }
			);
			toast.success("Room joined successfully");
		} catch (error) {
			toast.error("Error joining room");
		}
	};

	const handleRoomClick = (roomId) => {
		setSelectedRoom(roomId);
	};

	const handleLogout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error("Error logging out: ", error);
			toast.error("Error logging out");
		}
	};

	return (
		<div className='flex h-screen bg-gray-900'>
			{/* Left Section */}
			<div className='flex flex-col w-1/4 p-4 bg-gray-800 text-white border-r border-green-400'>
				<div className='text-lg flex items-center gap-x-2 mb-4 text-green-400'>
					<img
						src='favicon.png'
						alt='Lingua Link'
						style={{
							width: "50px",
							height: "50px",
						}}
					/>
					Lingua Link
				</div>

				{/* Show profile image and username of the user */}
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center gap-x-2 text-sm'>
						<img
							src={users[currentUser.uid]?.profileImageUrl}
							alt={users[currentUser.uid]?.username}
							className='w-12 h-12 rounded-full'
						/>
						<p className='text-white text-sm font-semibold bg-green-700 p-1 rounded-full px-2'>
							{users[currentUser.uid]?.username}
						</p>
					</div>
					<button
						onClick={() => setProfileSettingsOpen(true)} // Set profileSettingsOpen to true to open the profile settings popup
						className='text-green-500 flex items-center gap-x-2 hover:underline hover:text-green-600'>
						<Settings />
					</button>
				</div>

				<h1 className='text-xl font-semibold mb-4 flex items-center gap-x-2'>
					<UsersRound />
					Joined Rooms
				</h1>
				<ul>
					{joinedRooms.map((roomId) => {
						const room = rooms.find((room) => room.id === roomId);
						return (
							<li
								key={roomId}
								className='mb-2 flex items-center justify-between'>
								<button
									onClick={() => handleRoomClick(roomId)}
									className='text-green-500 hover:underline'>
									{room ? room.name : "Unknown Room"}
								</button>

								<p className='text-xs text-gray-400 '>
									{room?.joinedUsers.length} members
								</p>
							</li>
						);
					})}
				</ul>

				{/* Search Rooms */}
				<button
					onClick={() => setSelectedRoom(false)}
					className='bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-4 flex items-center justify-center gap-x-2'>
					<Search /> Search New Rooms
				</button>

				{/* Set these button at the bottom */}
				<div className='mt-auto flex flex-col gap-y-4'>
					<button
						onClick={handleLogout}
						className='text-red-500 flex items-center gap-x-2 hover:underline hover:text-red-600'>
						<Power /> Logout
					</button>
				</div>
			</div>

			{/* Right Section */}
			<div className='flex-1 p-4'>
				{selectedRoom ? (
					<ChatRoom roomId={selectedRoom} setRoom={setSelectedRoom} />
				) : (
					<>
						{/* Create a chat room */}
						<div className='bg-gray-700 rounded-md shadow-md p-4 mb-4'>
							<h2 className='text-lg font-semibold mb-4 text-green-500'>
								Create a Chat Room
							</h2>
							<form onSubmit={handleCreateRoom} className='flex'>
								<input
									type='text'
									value={roomName}
									onChange={(e) => setRoomName(e.target.value)}
									className='flex-1 p-2 border border-gray-600 bg-gray-800 text-gray-300 rounded mr-2'
									placeholder='Enter room name'
									required
								/>
								<button
									className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
									type='submit'>
									Create
								</button>
							</form>
						</div>
						{/* Join existing chat rooms */}
						<div className='bg-gray-700 rounded-md shadow-md p-4'>
							<h2 className='text-lg font-semibold mb-4 text-green-500'>
								Join a Chat Room
							</h2>
							<ul>
								{rooms
									.filter((room) => !joinedRooms.includes(room.id))
									.map((room) => (
										<li key={room.id} className='mb-2'>
											<div className='flex items-center justify-between'>
												<button
													onClick={() => handleJoinRoom(room.id)}
													className='text-green-500 hover:underline cursor-pointer'>
													{room.name}
												</button>

												<p className='text-xs text-gray-400'>
													{room.joinedUsers.length} members
												</p>

												<p className='text-xs text-green-200 rounded-full bg-green-700 p-1 px-2'>
													Created by: {users[room.ownerId]?.username}
												</p>
											</div>
										</li>
									))}
							</ul>
						</div>
					</>
				)}
			</div>

			{/* Profile Settings Popup */}
			{profileSettingsOpen && (
				<ProfileSettingsPopup
					user={currentUser}
					username={users[currentUser.uid]?.username}
					setUsername={(newUsername) => {
						// Update username in state
						const updatedUsers = { ...users };
						updatedUsers[currentUser.uid].username = newUsername;
						setUsers(updatedUsers);
					}}
					profileImage={users[currentUser.uid]?.profileImageUrl}
					setProfileImage={(newProfileImage) => {
						// Update profile image in state
						const updatedUsers = { ...users };
						updatedUsers[currentUser.uid].profileImageUrl = newProfileImage;
						setUsers(updatedUsers);
					}}
					onClose={() => setProfileSettingsOpen(false)} // Close the popup
				/>
			)}
		</div>
	);
};

export default ChatRooms;
