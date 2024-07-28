import React from "react";
import { X } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 flex items-center justify-center z-50'>
			<div className='bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-md'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-lg font-semibold text-green-500'>Confirmation</h2>
					<button onClick={onClose} className='text-gray-300 hover:text-white'>
						<X size={24} />
					</button>
				</div>
				<p className='text-gray-300 mb-4'>{message}</p>
				<div className='flex justify-end gap-4'>
					<button
						onClick={onClose}
						className='py-2 px-4 bg-gray-500 text-white hover:bg-gray-600 rounded'>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className='py-2 px-4 bg-red-500 text-white hover:bg-red-600 rounded'>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
