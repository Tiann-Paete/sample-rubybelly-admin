import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ViandsModal({ isOpen, onClose, product, onProductAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    serves: '',
    quantity: '',
    price: ''
  });

  useEffect(() => {
    if (isOpen && !product) {
      setFormData({
        name: '',
        description: '',
        image_url: '',
        serves: '',
        quantity: '',
        price: ''
      });
    } else if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        image_url: product.image_url || '',
        serves: product.serves || '',
        quantity: product.quantity || '',
        price: product.price || ''
      });
    }
  }, [isOpen, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (product && product.productviands_id) {
        // Update existing product
        await axios.put(`/api/aviand-products/${product.productviands_id}`, formData);
      } else {
        // Add new product
        await axios.post('/api/aviand-products', formData);
      }
      onProductAdded();
      onClose();
    } catch (error) {
      console.error('Error saving Viand product:', error);
      alert('Failed to save product');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-black">
          {product ? 'Edit Viand Product' : 'Add Viand Product'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
          />
          <input
            type="text"
            name="image_url"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
          />
          <input
            type="text"
            name="serves"
            placeholder="Serves"
            value={formData.serves}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
          />
           <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
            step="0.01"
            min="0"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
          />
          <div className="flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-500 text-white p-2 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-green-500 text-white p-2 rounded"
            >
              {product ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}