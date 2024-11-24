import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import { useRouter } from 'next/router';
import ViandsModal from '../components/ViandsModal';
import ViandsImage from '../components/ViandsImage';

export default function AProductViands() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/check-auth');
        if (!response.data.isAuthenticated) {
          router.push('/');
        } else {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/aviand-products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching Viand products:', error);
    }
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.put(`/api/aviand-products/${productToDelete.productviands_id}/soft-delete`);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting Viand product:', error);
      alert('Failed to delete product');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="bg-gray-800 w-full lg:w-1/4 text-white p-4">
        <div className="flex flex-col items-center mb-4">
          <FaUserCircle className="w-16 h-16 text-white" />
          <h2 className="mt-2">Admin</h2>
        </div>
        <nav className="space-y-2">
          <Link href="/AProduct">
            <button className="w-full text-left p-2">Lechon Products</button>
          </Link>
          <Link href="/AProductViands">
            <button className="w-full text-left p-2 bg-red-700 rounded">Viand Products</button>
          </Link>
          <Link href="/AStaff">
            <button className="w-full text-left p-2">Staff</button>
          </Link>
          <Link href="/ACustomerInfo">
            <button className="w-full text-left p-2">Customer's Info</button>
          </Link>
          <Link href="/AOrders">
            <button className="w-full text-left p-2">Orders</button>
          </Link>
        </nav>
        <div className="mt-auto">
          <button onClick={handleLogout} className="w-full text-left p-2 bg-red-500 text-white rounded">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl text-black font-bold">Viands List</h1>
          <button 
            onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}
            className="bg-green-500 text-white p-2 rounded"
          >
            Add Viand
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-red-700 text-white">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Image</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Serves</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.productviands_id} className="text-black">
                  <td className="p-2 border">{product.productviands_id}</td>
                  <td className="p-2 border">
                    <img
                      src={product.image_url || '/placeholder-viand.jpg'}
                      alt={`${product.name} viand`}
                      className="w-20 h-20 object-cover cursor-pointer rounded"
                      onClick={() => handleImageClick(product.image_url)}
                    />
                  </td>
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">
                    <div className="max-w-xs overflow-hidden">
                      {product.description.length > 100 
                        ? `${product.description.substring(0, 100)}...`
                        : product.description
                      }
                    </div>
                  </td>
                  <td className="p-2 border">{product.serves}</td>
                  <td className="p-2 border">₱{product.price}</td>
                  <td className="p-2 border">{product.quantity}</td>
                  <td className="p-2 border space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsModalOpen(true);
                      }}
                      className="bg-blue-500 text-white p-1 rounded"
                    >
                      Update
                    </button>
                    <button 
                      onClick={() => handleDelete(product)}
                      className="bg-red-500 text-white p-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`bg-gray-500 text-white p-2 rounded-lg ${
              currentPage === 1 ? 'opacity-50' : ''
            }`}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`bg-gray-500 text-white p-2 rounded-lg ${
              currentPage === totalPages ? 'opacity-50' : ''
            }`}
          >
            Next
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-red-600 mb-2">Confirm Deletion</h3>
                <p className="text-gray-600">Are you sure you want to delete this viand product?</p>
                <p className="font-medium text-gray-700 mt-2">
                  {productToDelete?.name} - Serves {productToDelete?.serves} - ₱{productToDelete?.price}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  This action can be reversed by an administrator if needed.
                </p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProductToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other Modals */}
        <ViandsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          onProductAdded={fetchProducts}
        />
        <ViandsImage
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={selectedImage}
        />
      </main>
    </div>
  );
}