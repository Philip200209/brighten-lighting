import { useState, useRef, useEffect, useCallback } from 'react';
import { productsService } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Search, Upload, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Pendant Lights',
  'Ceiling Lights',
  'Wall Lights',
  'Floor Lights',
  'Table Lamps',
  'Outdoor Lights',
  'Decorative Bulbs',
  'Smart Lights',
];

export function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image_url: '',
    stock: 10,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Load products on mount
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      image_url: '',
      stock: 10,
    });
    setImagePreview(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!imagePreview && !editingId) {
      toast.error('Please upload a product image');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        image_url: imagePreview || formData.image_url,
        stock: Number(formData.stock),
      };

      if (editingId) {
        // Update product
        await productsService.update(editingId, productData);
        toast.success('Product updated successfully');
      } else {
        // Create product
        await productsService.create(productData);
        toast.success('Product added successfully');
      }

      await loadProducts();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image_url: product.image_url,
      stock: product.stock || 10,
    });
    setImagePreview(product.image_url);
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsService.delete(id);
      toast.success('Product deleted successfully');
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-lighter border border-white/10 rounded-lg py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50"
          />
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-gold hover:bg-gold-light text-dark font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading products...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-dark-lighter border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="p-4 text-sm font-medium text-gray-400">Product</th>
                    <th className="p-4 text-sm font-medium text-gray-400">Category</th>
                    <th className="p-4 text-sm font-medium text-gray-400">Price</th>
                    <th className="p-4 text-sm font-medium text-gray-400">Stock</th>
                    <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-12 h-12 rounded-lg object-cover bg-dark" 
                          />
                          <span className="text-white font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{product.category}</td>
                      <td className="p-4 text-gold font-medium">KES {product.price.toLocaleString()}</td>
                      <td className="p-4 text-gray-300">{product.stock}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-gold/10 rounded-lg text-gray-400 hover:text-gold transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        {search ? 'No products found matching your search.' : 'No products yet. Add a new product to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {search ? 'No products found matching your search.' : 'No products yet. Add a new product to get started.'}
                </p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="bg-dark-lighter border border-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex gap-3">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-20 h-20 rounded-lg object-cover bg-dark shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{product.name}</h3>
                      <p className="text-sm text-gray-400">{product.category}</p>
                      <p className="text-gold font-medium mt-1">KES {product.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm border-t border-white/5 pt-3">
                    <div>
                      <p className="text-gray-400">Stock</p>
                      <p className="text-white font-medium">{product.stock}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="px-3 py-2 hover:bg-gold/10 rounded-lg text-gold hover:text-gold transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-dark-lighter border border-white/10 rounded-2xl w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif text-white">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                aria-label="Close dialog"
                className="text-gray-400 hover:text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                
                {/* Image Upload Area */}
                <div 
                  className="border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center h-40 sm:h-48 text-gray-400 hover:border-gold/50 transition-colors cursor-pointer relative overflow-hidden bg-dark"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gold" />
                      <span className="text-sm text-center px-4">Click to upload product image</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                
                {/* Form Fields */}
                <div className="space-y-3 sm:space-y-4">
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Product Name" 
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:border-gold/50 focus:outline-none" 
                  />
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="Price (KES)" 
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:border-gold/50 focus:outline-none" 
                  />
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:border-gold/50 focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="Stock Quantity" 
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:border-gold/50 focus:outline-none" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Product Overview
                  </label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Write the overview customers will see on the product page"
                    rows={4} 
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 sm:px-4 py-3 text-sm sm:text-base text-white resize-none focus:border-gold/50 focus:outline-none"
                  ></textarea>
                  <p className="text-xs text-gray-500">
                    This content appears on the public product page and in search results.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 sm:px-6 py-2.5 rounded-lg text-gray-400 hover:text-white text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 sm:px-6 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-dark font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : (
                    editingId ? 'Update Product' : 'Save Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
