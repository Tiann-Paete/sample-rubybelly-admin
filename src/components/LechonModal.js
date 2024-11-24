import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LechonModal({ 
  isOpen, 
  onClose, 
  product = null,
  onProductAdded 
}) {
  const [formData, setFormData] = useState({
    type: '',
    weight: '',
    description: '',
    image_url: '',
    price: '',
    quantity: ''
  });

  // Reset form when modal opens or closes, and specifically when no product is passed
  useEffect(() => {
    if (isOpen && !product) {
      // Clear the form when opening to add a new product
      setFormData({
        type: '',
        weight: '',
        description: '',
        image_url: '',
        price: '',
        quantity: ''
      });
    } else if (product) {
      // Populate form when a product is passed for updating
      setFormData({
        type: product.type || '',
        weight: product.weight || '',
        description: product.description || '',
        image_url: product.image_url || '',
        price: product.price || '',
        quantity: product.quantity || ''
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
      if (product && product.productlechon_id) {
        // Update existing product
        await axios.put(`/api/alechon-products/${product.productlechon_id}`, formData);
      } else {
        // Add new product
        await axios.post('/api/alechon-products', formData);
      }
      onProductAdded();
      onClose();
    } catch (error) {
      console.error('Error saving Lechon product:', error);
      alert('Failed to save product');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-black">
          {product ? 'Edit Lechon Product' : 'Add Lechon Product'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
          >
            <option value="">Select Lechon Type</option>
            <option value="Lechon Baboy">Lechon Baboy</option>
            <option value="Lechon Belly">Lechon Belly</option>
          </select>
          <input
            type="text"
            name="weight"
            placeholder="Weight"
            value={formData.weight}
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
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
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

