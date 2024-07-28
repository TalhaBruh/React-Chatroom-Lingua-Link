import React from "react";
import { X, Trash } from "lucide-react";

const MembersModal = ({
	isOpen,
	onClose,
	members,
	currentUser,
	roomOwner,
	handleRemoveUser,
}) => {
	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 flex items-center justify-center z-50'>
			<div className='bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-md'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-lg font-semibold text-green-500'>Room Members</h2>
					<button onClick={onClose} className='text-gray-300 hover:text-white'>
						<X size={24} />
					</button>
				</div>
				<ul>
					{members.map((member) => (
						<li
							key={member.uid}
							className='flex items-center justify-between mb-2'>
							<div className='flex items-center'>
								<img
									src={member.profileImageUrl}
									alt={member.username}
									className='w-10 h-10 rounded-full mr-3'
								/>
								<span className='text-gray-300'>{member.username}</span>
							</div>
							{currentUser.uid === roomOwner && member.uid !== roomOwner && (
								<button
									onClick={() => handleRemoveUser(member.uid)}
									className='text-red-500 hover:text-red-600'>
									<Trash size={16} />
								</button>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default MembersModal;
