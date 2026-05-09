import { useState, useRef, useEffect } from 'react';
import { getProducts, saveProducts, CATEGORIES } from '../../data/mockData';
import { Plus, Edit2, Trash2, Search, Upload, X } from 'lucide-react';

export function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    featured: false,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
      saveProducts(newProducts);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || !imagePreview) {
      alert("Please fill all required fields and upload an image.");
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      featured: formData.featured,
      image: imagePreview,
    };

    const newProducts = [newProduct, ...products];
    setProducts(newProducts);
    saveProducts(newProducts);
    
    // Reset form
    setIsModalOpen(false);
    setFormData({ name: '', price: '', category: '', description: '', featured: false });
    setImagePreview(null);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
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
          onClick={() => setIsModalOpen(true)}
          className="bg-gold hover:bg-gold-light text-dark font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="bg-dark-lighter border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-400">Product</th>
                <th className="p-4 text-sm font-medium text-gray-400">Category</th>
                <th className="p-4 text-sm font-medium text-gray-400">Price</th>
                <th className="p-4 text-sm font-medium text-gray-400">Featured</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-dark" />
                      <span className="text-white font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{product.category}</td>
                  <td className="p-4 text-gold font-medium">KSh {product.price.toLocaleString()}</td>
                  <td className="p-4 text-gray-300">{product.featured ? 'Yes' : 'No'}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
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
                    No products found. Add a new product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-lighter border border-white/10 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif text-white">Add New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-6">
                
                {/* Image Upload Area */}
                 <div 
                   className="col-span-2 md:col-span-1 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center h-48 text-gray-400 hover:border-gold/50 transition-colors cursor-pointer relative overflow-hidden bg-dark"
                   onClick={() => fileInputRef.current?.click()}
                 >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gold" />
                        <span className="text-sm text-center px-4">Click to upload from Gallery or PC</span>
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
                 <div className="col-span-2 md:col-span-1 space-y-4">
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Product Name" 
                      className="w-full bg-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold/50 focus:outline-none" 
                    />
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="Price (KSh)" 
                      className="w-full bg-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold/50 focus:outline-none" 
                    />
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold/50 focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer pt-2">
                      <input 
                        type="checkbox" 
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="w-4 h-4 accent-gold" 
                      />
                      Feature on Homepage
                    </label>
                 </div>
                 
                 <div className="col-span-2">
                   <textarea 
                     required
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                     placeholder="Product Description" 
                     rows={3} 
                     className="w-full bg-dark border border-white/10 rounded-lg px-4 py-2 text-white resize-none focus:border-gold/50 focus:outline-none"
                   ></textarea>
                 </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-dark font-medium transition-colors">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
