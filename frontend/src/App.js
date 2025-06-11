import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'LIQUOR CHOCOLATES',
    quantity: 6,
    ingredientCost: '',
    labourPercent: 30,
    packagingPercent: 16,
    manufacturingPercent: 11,
    marketingPercent: 11,
    logisticsPercent: 16,
    profitMargin: 75,
    mrpWithoutGst: ''
  });

  const productCategories = [
    'LIQUOR CHOCOLATES',
    'BON BON',
    'GANACHE',
    'TRUFFLES',
    'STICK PALO',
    'SQUARE BAR',
    'TRAVEL CAKES',
    'COOKIES- SMALL CHUNK',
    'SAVORY- VEGAN',
    'BROWNIE',
    'DRAGEES',
    'QUADRAPLETS SPREADS',
    'CHOCOLATE CUBE',
    'BISCOTTI',
    'CHOCOLATE FLOWER BAR'
  ];

  const boxCategories = ['LIQUOR CHOCOLATES', 'GANACHE', 'BON BON', 'TRUFFLES'];
  const quantityOptions = [6, 8, 12];

  // Load data from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('chocolateManufacturing_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('chocolateManufacturing_products', JSON.stringify(products));
  }, [products]);

  // Calculate cost breakdown
  const calculateCosts = (product) => {
    const ingredientCost = parseFloat(product.ingredientCost) || 0;
    
    const labour = (ingredientCost * product.labourPercent) / 100;
    const packaging = (ingredientCost * product.packagingPercent) / 100;
    const manufacturing = (ingredientCost * product.manufacturingPercent) / 100;
    const marketing = (ingredientCost * product.marketingPercent) / 100;
    const logistics = (ingredientCost * product.logisticsPercent) / 100;
    
    const totalCost = ingredientCost + labour + packaging + manufacturing + marketing + logistics;
    
    const profitAmount = (totalCost * product.profitMargin) / 100;
    const costPlusProfit = totalCost + profitAmount;
    
    const gstAmount = (costPlusProfit * 18) / 100;
    const mrpWithGst = costPlusProfit + gstAmount;
    
    return {
      ingredientCost,
      labour,
      packaging,
      manufacturing,
      marketing,
      logistics,
      totalCost,
      profitAmount,
      costPlusProfit,
      gstAmount,
      mrpWithGst
    };
  };

  // Add new product
  const addProduct = () => {
    if (newProduct.name && newProduct.ingredientCost) {
      const costs = calculateCosts(newProduct);
      const product = {
        id: Date.now(),
        ...newProduct,
        ingredientCost: parseFloat(newProduct.ingredientCost),
        ...costs
      };
      setProducts([...products, product]);
      setNewProduct({
        name: '',
        category: 'LIQUOR CHOCOLATES',
        quantity: 6,
        ingredientCost: '',
        labourPercent: 30,
        packagingPercent: 16,
        manufacturingPercent: 11,
        marketingPercent: 11,
        logisticsPercent: 16,
        profitMargin: 75,
        mrpWithoutGst: ''
      });
    }
  };

  // Delete product
  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  // Update product costs when form changes
  const updateProductField = (field, value) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  // Get current product costs for preview
  const previewCosts = calculateCosts(newProduct);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">ChocolatePro Calculator</div>
              <div className="ml-4 text-sm text-gray-600">Professional Manufacturing Cost Analysis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Product Creation
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'analysis'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Cost Analysis
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Manufacturing Dashboard
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Product Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Product</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => updateProductField('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    placeholder="e.g., WHISKEY DARK CHOCO GANACHE - Black dog / Teachers"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => updateProductField('category', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    >
                      {productCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {boxCategories.includes(newProduct.category) ? 'Box Quantity' : 'Pack Size'}
                    </label>
                    {boxCategories.includes(newProduct.category) ? (
                      <select
                        value={newProduct.quantity}
                        onChange={(e) => updateProductField('quantity', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      >
                        {quantityOptions.map((qty) => (
                          <option key={qty} value={qty}>
                            Box of {qty}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={newProduct.quantity}
                        onChange={(e) => updateProductField('quantity', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        placeholder="Individual / Jar / Pack"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.ingredientCost}
                    onChange={(e) => updateProductField('ingredientCost', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    placeholder="180"
                  />
                </div>

                {/* Cost Components */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Cost Components (% of Ingredient Cost)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Labour (%)</label>
                      <input
                        type="number"
                        value={newProduct.labourPercent}
                        onChange={(e) => updateProductField('labourPercent', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Packaging (%)</label>
                      <input
                        type="number"
                        value={newProduct.packagingPercent}
                        onChange={(e) => updateProductField('packagingPercent', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing (%)</label>
                      <input
                        type="number"
                        value={newProduct.manufacturingPercent}
                        onChange={(e) => updateProductField('manufacturingPercent', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marketing (%)</label>
                      <input
                        type="number"
                        value={newProduct.marketingPercent}
                        onChange={(e) => updateProductField('marketingPercent', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logistics (%)</label>
                      <input
                        type="number"
                        value={newProduct.logisticsPercent}
                        onChange={(e) => updateProductField('logisticsPercent', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profit Margin (%)</label>
                      <input
                        type="number"
                        value={newProduct.profitMargin}
                        onChange={(e) => updateProductField('profitMargin', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                {newProduct.ingredientCost && (
                  <div className="bg-amber-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-amber-800 mb-2">Cost Preview</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Ingredient: ₹{previewCosts.ingredientCost.toFixed(0)}</div>
                      <div>Labour: ₹{previewCosts.labour.toFixed(0)}</div>
                      <div>Packaging: ₹{previewCosts.packaging.toFixed(0)}</div>
                      <div>Manufacturing: ₹{previewCosts.manufacturing.toFixed(0)}</div>
                      <div>Marketing: ₹{previewCosts.marketing.toFixed(0)}</div>
                      <div>Logistics: ₹{previewCosts.logistics.toFixed(0)}</div>
                      <div className="font-semibold border-t pt-1">Total Cost: ₹{previewCosts.totalCost.toFixed(0)}</div>
                      <div className="font-semibold border-t pt-1">Profit: ₹{previewCosts.profitAmount.toFixed(0)}</div>
                      <div className="font-semibold text-green-600">Cost + Profit: ₹{previewCosts.costPlusProfit.toFixed(0)}</div>
                      <div className="font-semibold text-blue-600">GST (18%): ₹{previewCosts.gstAmount.toFixed(0)}</div>
                      <div className="font-bold text-lg text-amber-700 col-span-2 border-t pt-1">
                        MRP with GST: ₹{previewCosts.mrpWithGst.toFixed(0)}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={addProduct}
                  className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                >
                  Create Product
                </button>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Portfolio</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-amber-600">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <div className="text-sm text-gray-600">
                          {product.category} - {boxCategories.includes(product.category) ? `Box of ${product.quantity}` : product.quantity}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>Total Cost: ₹{product.totalCost.toFixed(0)}</div>
                      <div>Profit: {product.profitMargin}%</div>
                      <div className="font-semibold text-amber-700">MRP: ₹{product.mrpWithGst.toFixed(0)}</div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No products created yet. Create your first product to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-amber-600">{products.length}</div>
                <div className="text-gray-600">Total Products</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-green-600">
                  ₹{products.length > 0 
                    ? (products.reduce((sum, product) => sum + product.mrpWithGst, 0) / products.length).toFixed(0)
                    : '0'}
                </div>
                <div className="text-gray-600">Avg MRP</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-blue-600">
                  {products.length > 0 
                    ? (products.reduce((sum, product) => sum + product.profitMargin, 0) / products.length).toFixed(0)
                    : 0}%
                </div>
                <div className="text-gray-600">Avg Profit Margin</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-purple-600">
                  ₹{products.length > 0 
                    ? (products.reduce((sum, product) => sum + product.totalCost, 0) / products.length).toFixed(0)
                    : '0'}
                </div>
                <div className="text-gray-600">Avg Total Cost</div>
              </div>
            </div>

            {/* Detailed Analysis Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Cost Analysis</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold">Product Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Category</th>
                      <th className="text-left py-3 px-4 font-semibold">Ingredient</th>
                      <th className="text-left py-3 px-4 font-semibold">Labour</th>
                      <th className="text-left py-3 px-4 font-semibold">Packaging</th>
                      <th className="text-left py-3 px-4 font-semibold">Manufacturing</th>
                      <th className="text-left py-3 px-4 font-semibold">Marketing</th>
                      <th className="text-left py-3 px-4 font-semibold">Logistics</th>
                      <th className="text-left py-3 px-4 font-semibold bg-yellow-100">Total Cost</th>
                      <th className="text-left py-3 px-4 font-semibold">Profit %</th>
                      <th className="text-left py-3 px-4 font-semibold">Selling Price</th>
                      <th className="text-left py-3 px-4 font-semibold bg-green-100">MRP with GST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-sm">{product.name}</td>
                        <td className="py-3 px-4 text-sm">{product.category}</td>
                        <td className="py-3 px-4 text-sm">₹{product.ingredientCost.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">₹{product.labour.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">₹{product.packaging.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">₹{product.manufacturing.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">₹{product.marketing.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">₹{product.logistics.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm font-semibold bg-yellow-50">₹{product.totalCost.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">{product.profitMargin}%</td>
                        <td className="py-3 px-4 text-sm">₹{product.costPlusProfit.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm font-bold bg-green-50">₹{product.mrpWithGst.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No products to analyze yet. Create some products first.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Category Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productCategories.map((category) => {
                  const categoryProducts = products.filter(p => p.category === category);
                  const avgMrp = categoryProducts.length > 0 
                    ? categoryProducts.reduce((sum, p) => sum + p.mrpWithGst, 0) / categoryProducts.length
                    : 0;
                  const avgMargin = categoryProducts.length > 0 
                    ? categoryProducts.reduce((sum, p) => sum + p.profitMargin, 0) / categoryProducts.length
                    : 0;
                  
                  return (
                    <div key={category} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">{category}</h3>
                      <div className="space-y-1 text-sm">
                        <div>Products: {categoryProducts.length}</div>
                        <div>Avg MRP: ₹{avgMrp.toFixed(0)}</div>
                        <div>Avg Margin: {avgMargin.toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Profit Margin Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profit Margin Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Low Margin (&lt;60%)</h3>
                  <div className="space-y-2">
                    {products
                      .filter(product => product.profitMargin < 60)
                      .map(product => (
                        <div key={product.id} className="text-sm">
                          <div className="font-medium">{product.name.slice(0, 30)}...</div>
                          <div className="text-red-600">{product.profitMargin}%</div>
                        </div>
                      ))}
                    {products.filter(product => product.profitMargin < 60).length === 0 && (
                      <div className="text-gray-500 text-sm">None</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Medium Margin (60-70%)</h3>
                  <div className="space-y-2">
                    {products
                      .filter(product => product.profitMargin >= 60 && product.profitMargin < 70)
                      .map(product => (
                        <div key={product.id} className="text-sm">
                          <div className="font-medium">{product.name.slice(0, 30)}...</div>
                          <div className="text-yellow-600">{product.profitMargin}%</div>
                        </div>
                      ))}
                    {products.filter(product => product.profitMargin >= 60 && product.profitMargin < 70).length === 0 && (
                      <div className="text-gray-500 text-sm">None</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Good Margin (70-80%)</h3>
                  <div className="space-y-2">
                    {products
                      .filter(product => product.profitMargin >= 70 && product.profitMargin < 80)
                      .map(product => (
                        <div key={product.id} className="text-sm">
                          <div className="font-medium">{product.name.slice(0, 30)}...</div>
                          <div className="text-green-600">{product.profitMargin}%</div>
                        </div>
                      ))}
                    {products.filter(product => product.profitMargin >= 70 && product.profitMargin < 80).length === 0 && (
                      <div className="text-gray-500 text-sm">None</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">High Margin (80%+)</h3>
                  <div className="space-y-2">
                    {products
                      .filter(product => product.profitMargin >= 80)
                      .map(product => (
                        <div key={product.id} className="text-sm">
                          <div className="font-medium">{product.name.slice(0, 30)}...</div>
                          <div className="text-blue-600">{product.profitMargin}%</div>
                        </div>
                      ))}
                    {products.filter(product => product.profitMargin >= 80).length === 0 && (
                      <div className="text-gray-500 text-sm">None</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;