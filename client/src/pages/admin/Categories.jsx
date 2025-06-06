import React, { useState, useEffect, Fragment } from 'react';
import { CategoryService } from '../../services/Api';
import { Dialog, Transition } from '@headlessui/react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCheck, FaTimes } from 'react-icons/fa';

const Categories = () => {
    // State management
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch all categories from API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await CategoryService.getAllCategories();
            setCategories(response.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch categories: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'isActive' ? checked : value
        });
    };

    // Open dialog for adding new category
    const handleAddClick = () => {
        setFormData({ name: '', description: '', isActive: true });
        setIsEditing(false);
        setOpenDialog(true);
    };

    // Open dialog for editing category
    const handleEditClick = (category) => {
        setFormData({
            name: category.name,
            description: category.description || '',
            isActive: category.isActive
        });
        setCurrentId(category.id);
        setIsEditing(true);
        setOpenDialog(true);
    };

    // Handle dialog close
    const handleClose = () => {
        setOpenDialog(false);
    };

    // Form submission handler
    const handleSubmit = async () => {
        try {
            if (!formData.name.trim()) {
                setNotification({
                    open: true,
                    message: 'Category name is required',
                    severity: 'error'
                });
                return;
            }

            setLoading(true);
            let response;

            if (isEditing) {
                response = await CategoryService.updateCategory(currentId, formData);
                setNotification({
                    open: true,
                    message: 'Category updated successfully!',
                    severity: 'success'
                });
            } else {
                response = await CategoryService.createCategory(formData);
                setNotification({
                    open: true,
                    message: 'Category created successfully!',
                    severity: 'success'
                });
            }

            // Refresh categories list
            fetchCategories();
            setOpenDialog(false);
        } catch (err) {
            setNotification({
                open: true,
                message: `Failed to ${isEditing ? 'update' : 'create'} category: ${err.message || 'Unknown error'}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Delete category handler
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            try {
                setLoading(true);
                await CategoryService.deleteCategory(id);
                fetchCategories();
                setNotification({
                    open: true,
                    message: 'Category deleted successfully!',
                    severity: 'success'
                });
            } catch (err) {
                setNotification({
                    open: true,
                    message: `Failed to delete category: ${err.message || 'Unknown error'}`,
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    // Toggle category active status
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            setLoading(true);
            await CategoryService.toggleCategoryStatus(id);
            fetchCategories();
            setNotification({
                open: true,
                message: `Category ${currentStatus ? 'deactivated' : 'activated'} successfully!`,
                severity: 'success'
            });
        } catch (err) {
            setNotification({
                open: true,
                message: `Failed to update category status: ${err.message || 'Unknown error'}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Close notification
    const handleNotificationClose = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Feedback Categories
                </h1>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
                    onClick={handleAddClick}
                >
                    <FaPlus className="mr-2" />
                    Add Category
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}

            {loading && !openDialog ? (
                <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No categories found. Add a new category to get started.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center">
                                                {category.isActive ? (
                                                    <div className="flex items-center text-green-600">
                                                        <FaToggleOn className="mr-1 h-5 w-5" />
                                                        <span>Active</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-gray-400">
                                                        <FaToggleOff className="mr-1 h-5 w-5" />
                                                        <span>Inactive</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                            <button
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                                title="Edit"
                                                onClick={() => handleEditClick(category)}
                                            >
                                                <FaEdit className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-800 mr-3"
                                                title="Delete"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                <FaTrash className="h-5 w-5" />
                                            </button>
                                            <button
                                                className={`${category.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                                                title={category.isActive ? "Deactivate" : "Activate"}
                                                onClick={() => handleToggleStatus(category.id, category.isActive)}
                                            >
                                                {category.isActive ? (
                                                    <FaToggleOff className="h-5 w-5" />
                                                ) : (
                                                    <FaToggleOn className="h-5 w-5" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Category Form Dialog */}
            <Transition appear show={openDialog} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={handleClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {isEditing ? 'Edit Category' : 'Add New Category'}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <div className="mb-4">
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows="3"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            ></textarea>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="isActive"
                                                name="isActive"
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                                Active
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none"
                                            onClick={handleClose}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                                            onClick={handleSubmit}
                                        >
                                            {loading ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                isEditing ? 'Update' : 'Create'
                                            )}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Notification Toast */}
            {notification.open && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div
                        className={`${notification.severity === 'success'
                            ? 'bg-green-50 text-green-800 border-green-500'
                            : 'bg-red-50 text-red-800 border-red-500'
                            } p-4 rounded-md shadow-lg border-l-4 max-w-md`}
                    >
                        <div className="flex justify-between">
                            <div className="flex">
                                {notification.severity === 'success' ? (
                                    <FaCheck className="h-5 w-5 text-green-400 mr-2" />
                                ) : (
                                    <FaTimes className="h-5 w-5 text-red-400 mr-2" />
                                )}
                                <p>{notification.message}</p>
                            </div>
                            <button
                                className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
                                onClick={handleNotificationClose}
                            >
                                <FaTimes className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
