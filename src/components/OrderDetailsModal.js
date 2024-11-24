import React from 'react';
import { X } from 'lucide-react';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-red-700">Order Details</h2>
        
        <div className="space-y-3">
          <div>
            <label className="font-semibold text-gray-700">Tracking Number:</label>
            <p className="text-gray-500">{order.tracking_number}</p>
          </div>
          
          <div>
            <label className="font-semibold text-gray-700">Customer ID:</label>
            <p className="text-gray-500">{order.customerid}</p>
          </div>
          
          <div>
            <label className="font-semibold text-gray-700">Order Items:</label>
            <div className="mt-2 space-y-2">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-700">{item.name}</p>
                  <p className="text-gray-500">
                    Quantity: {item.quantity} × ₱{item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="font-semibold text-gray-700">Total Amount:</label>
            <p className="text-gray-500">₱{order.total_amount}</p>
          </div>
          
          <div>
            <label className="font-semibold text-gray-700">Payment Method:</label>
            <p className="text-gray-500">{order.payment_method}</p>
          </div>
          
          <div>
            <label className="font-semibold text-gray-700">Delivery Address:</label>
            <p className="text-gray-500 break-words">{order.delivery_address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;