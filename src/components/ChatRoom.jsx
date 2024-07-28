import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
	doc,
	updateDoc,
	onSnapshot,
	deleteDoc,
	getDoc,
	arrayRemove,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
	LogOut,
	Trash,
	Send,
	MessageSquareOff,
	UsersRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MembersModal from "./MembersModal"; // Import the modal component
import ConfirmationModal from "./ConfirmationModal"; // Import the confirmation modal

const ChatRoom = ({ roomId, setRoom }) => {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const [roomName, setRoomName] = useState("");
	const [roomOwner, setRoomOwner] = useState("");
	const [members, setMembers] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [confirmationAction, setConfirmationAction] = useState(null);
	const [confirmationMessage, setConfirmationMessage] = useState("");
	const navigation = useNavigate();
	const { currentUser, users } = useAuth();

	useEffect(() => {
		const unsubscribe = onSnapshot(
			doc(db, "chatRooms", roomId),
			(doc) => {
				if (doc.exists()) {
					const data = doc.data();
					setMessages(data.messages || []);
					setRoomName(data.name || "");
					setRoomOwner(data.ownerId || "");
					setMembers(data.joinedUsers || []);
				} else {
					toast.info("The room has been deleted");
					setRoom(false);
					navigation("/");
				}
			},
			(err) => {
				toast.error("Error fetching messages");
			}
		);

		return unsubscribe;
	}, [roomId]);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!message.trim()) {
			return;
		}
		try {
			const newMessage = {
				text: message,
				createdAt: new Date(),
				uid: currentUser.uid,
			};

			await updateDoc(doc(db, "chatRooms", roomId), {
				messages: [...messages, newMessage],
			});

			setMessage("");
		} catch (error) {
			toast.error("Error sending message");
		}
	};

	const handleLeaveRoom = async () => {
		try {
			await updateDoc(doc(db, "users", currentUser.uid), {
				joinedRooms: arrayRemove(roomId),
			});

			setRoom(false);
			toast.success("Left the room successfully");
			navigation("/");
		} catch (error) {
			toast.error("Error leaving room");
		}
	};

	const handleDeleteRoom = async () => {
		try {
			const roomRef = doc(db, "chatRooms", roomId);
			const roomSnapshot = await getDoc(roomRef);
			const roomData = roomSnapshot.data();
			const joinedUsers = roomData?.joinedUsers || [];

			await deleteDoc(roomRef);

			for (const user of joinedUsers) {
				const userRef = doc(db, "users", user);
				const userSnapshot = await getDoc(userRef);
				const userData = userSnapshot.data();

				if (userData) {
					await updateDoc(userRef, {
						joinedRooms: userData.joinedRooms.filter((room) => room !== roomId),
					});
				}
			}

			setRoom(false);
			navigation("/");
		} catch (error) {
			toast.error("Error deleting room");
		}
	};

	const handleRemoveUser = async (userId) => {
		try {
			await updateDoc(doc(db, "chatRooms", roomId), {
				joinedUsers: arrayRemove(userId),
			});

			await updateDoc(doc(db, "users", userId), {
				joinedRooms: arrayRemove(roomId),
			});

			toast.success("User removed successfully");
		} catch (error) {
			toast.error("Error removing user");
		}
	};

	const openConfirmationModal = (action, message) => {
		setConfirmationAction(() => action);
		setConfirmationMessage(message);
		setIsConfirmationModalOpen(true);
	};

	const confirmAction = () => {
		if (confirmationAction) {
			confirmationAction();
		}
		setIsConfirmationModalOpen(false);
	};

	return (
		<div className='flex flex-col h-full'>
			<div className='flex justify-between items-center bg-gray-800 text-white p-4 border-b border-green-400 shadow rounded-t'>
				<div className='flex items-center gap-4'>
					<h1 className='text-xl font-semibold'>{roomName}</h1>
					<p className='text-sm text-gray-400'>
						Owner: {users[roomOwner]?.username}
					</p>
				</div>

				<div className='flex items-center gap-4'>
					{currentUser.uid === roomOwner && (
						<>
							<button
								onClick={() => setRoom(false)}
								className='py-2 px-4 bg-gray-500 text-white hover:bg-gray-600 rounded flex items-center gap-2 text-sm'>
								<MessageSquareOff size={16} />
							</button>
							<button
								onClick={() => setIsModalOpen(true)} // Open the modal
								className='py-2 px-4 bg-green-500 text-white hover:bg-green-600 rounded flex items-center gap-2 text-sm'>
								<UsersRound size={16} />
							</button>
						</>
					)}
					<button
						onClick={() =>
							openConfirmationModal(
								handleLeaveRoom,
								"Are you sure you want to leave the room?"
							)
						}
						className='py-2 px-4 bg-yellow-500 text-white hover:bg-yellow-600 rounded flex items-center gap-2 text-sm'>
						<LogOut size={16} />
					</button>
					{currentUser.uid === roomOwner && (
						<button
							onClick={() =>
								openConfirmationModal(
									handleDeleteRoom,
									"Are you sure you want to delete the room?"
								)
							}
							className='py-2 px-4 bg-red-500 text-white hover:bg-red-600 rounded flex items-center gap-2 text-sm'>
							<Trash size={16} />
						</button>
					)}
				</div>
			</div>
			<div className='flex-1 overflow-auto p-4'>
				{messages.map((msg, index) => {
					const messageTime = new Date(
						msg.createdAt.toDate()
					).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					});

					return (
						<div
							key={index}
							className={`mb-2 flex ${
								msg.uid === currentUser.uid ? "justify-end" : "justify-start"
							}`}>
							{msg.uid !== currentUser.uid && (
								<img
									src={users[msg.uid]?.profileImageUrl}
									alt={users[msg.uid]?.username}
									className='w-10 h-10 rounded-full mr-3 self-start'
								/>
							)}
							<div className='flex flex-col items-start'>
								<div
									className={`flex flex-col max-w-xs p-3 rounded-lg shadow-md ${
										msg.uid === currentUser.uid
											? "bg-green-700 text-green-300"
											: "bg-gray-700 text-gray-300"
									}`}>
									<strong className='text-sm mb-1'>
										{users[msg.uid]?.username}
									</strong>
									<span className='text-sm'>{msg.text}</span>
								</div>
								<span
									className={`text-xs mt-1 self-end ${
										msg.uid === currentUser.uid
											? "text-green-300"
											: "text-gray-400"
									}`}>
									{messageTime}
								</span>
							</div>

							{msg.uid === currentUser.uid && (
								<img
									src={users[msg.uid]?.profileImageUrl}
									alt={users[msg.uid]?.username}
									className='w-10 h-10 rounded-full ml-3 self-start'
								/>
							)}
						</div>
					);
				})}
			</div>

			<form
				onSubmit={handleSendMessage}
				className='p-3 border-t border-green-400 flex items-center'>
				<input
					type='text'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className='flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none bg-gray-800 text-gray-300'
					placeholder='Type your message'
				/>
				<button
					className='bg-green-500 text-white py-2 px-4 rounded-r-md border border-green-500 hover:bg-green-600 flex items-center gap-x-2 focus:outline-none'
					type='submit'>
					<Send />
					<span className='hidden sm:inline'>Send</span>
				</button>
			</form>

			<MembersModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				members={members.map((uid) => ({
					uid,
					username: users[uid]?.username,
					profileImageUrl: users[uid]?.profileImageUrl,
				}))}
				currentUser={currentUser}
				roomOwner={roomOwner}
				handleRemoveUser={handleRemoveUser}
			/>

			<ConfirmationModal
				isOpen={isConfirmationModalOpen}
				onClose={() => setIsConfirmationModalOpen(false)}
				onConfirm={confirmAction}
				message={confirmationMessage}
			/>
		</div>
	);
};

export default ChatRoom;
