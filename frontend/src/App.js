import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [calculatorMode, setCalculatorMode] = useState('cost-to-price'); // 'cost-to-price' or 'price-to-cost'
  const [products, setProducts] = useState([]);
  
  // Calculator inputs
  const [calcInputs, setCalcInputs] = useState({
    productName: '',
    category: 'LIQUOR CHOCOLATES',
    quantity: 6,
    ingredientCost: '',
    labourPercent: 30,
    packagingPercent: 16,
    manufacturingPercent: 11,
    marketingPercent: 11,
    logisticsPercent: 16,
    targetSellingPrice: '', // For back-calculation
    targetMargin: 75
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

  // Load saved products
  useEffect(() => {
    const savedProducts = localStorage.getItem('chocolatePricing_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save products
  useEffect(() => {
    localStorage.setItem('chocolatePricing_products', JSON.stringify(products));
  }, [products]);

  // Core calculation engine - Forward calculation (Cost to Price)
  const calculatePricing = (inputs) => {
    const ingredientCost = parseFloat(inputs.ingredientCost) || 0;
    
    const labour = (ingredientCost * inputs.labourPercent) / 100;
    const packaging = (ingredientCost * inputs.packagingPercent) / 100;
    const manufacturing = (ingredientCost * inputs.manufacturingPercent) / 100;
    const marketing = (ingredientCost * inputs.marketingPercent) / 100;
    const logistics = (ingredientCost * inputs.logisticsPercent) / 100;
    
    const totalCost = ingredientCost + labour + packaging + manufacturing + marketing + logistics;
    
    // Multiple margin scenarios
    const scenarios = [60, 70, 75, 80, 85].map(margin => {
      const profitAmount = (totalCost * margin) / 100;
      const sellingPriceBeforeGST = totalCost + profitAmount;
      const gstAmount = (sellingPriceBeforeGST * 18) / 100;
      const finalSellingPrice = sellingPriceBeforeGST + gstAmount;
      
      return {
        margin,
        profitAmount,
        sellingPriceBeforeGST,
        gstAmount,
        finalSellingPrice
      };
    });
    
    return {
      ingredientCost,
      labour,
      packaging,
      manufacturing,
      marketing,
      logistics,
      totalCost,
      scenarios
    };
  };

  // Core calculation engine - Reverse calculation (Price to Cost)
  const calculateReversePricing = (inputs) => {
    const targetFinalPrice = parseFloat(inputs.targetSellingPrice) || 0;
    const targetMargin = inputs.targetMargin;
    
    // Remove GST to get price before GST
    const sellingPriceBeforeGST = targetFinalPrice / 1.18;
    const gstAmount = targetFinalPrice - sellingPriceBeforeGST;
    
    // Calculate required total cost based on target margin
    const requiredTotalCost = sellingPriceBeforeGST / (1 + targetMargin / 100);
    const profitAmount = sellingPriceBeforeGST - requiredTotalCost;
    
    // Calculate total component percentage
    const totalComponentPercent = inputs.labourPercent + inputs.packagingPercent + 
                                 inputs.manufacturingPercent + inputs.marketingPercent + 
                                 inputs.logisticsPercent;
    
    // Back-calculate ingredient cost
    const maxIngredientCost = requiredTotalCost / (1 + totalComponentPercent / 100);
    
    // Calculate individual components
    const labour = (maxIngredientCost * inputs.labourPercent) / 100;
    const packaging = (maxIngredientCost * inputs.packagingPercent) / 100;
    const manufacturing = (maxIngredientCost * inputs.manufacturingPercent) / 100;
    const marketing = (maxIngredientCost * inputs.marketingPercent) / 100;
    const logistics = (maxIngredientCost * inputs.logisticsPercent) / 100;
    
    const calculatedTotalCost = maxIngredientCost + labour + packaging + manufacturing + marketing + logistics;
    
    return {
      targetFinalPrice,
      sellingPriceBeforeGST,
      gstAmount,
      requiredTotalCost: calculatedTotalCost,
      maxIngredientCost,
      labour,
      packaging,
      manufacturing,
      marketing,
      logistics,
      profitAmount,
      actualMargin: (profitAmount / sellingPriceBeforeGST) * 100
    };
  };

  // Update calculator inputs
  const updateCalcInputs = (field, value) => {
    setCalcInputs(prev => ({ ...prev, [field]: value }));
  };

  // Save calculated product
  const saveProduct = (calculations) => {
    if (calcInputs.productName) {
      const product = {
        id: Date.now(),
        name: calcInputs.productName,
        category: calcInputs.category,
        quantity: calcInputs.quantity,
        ...calcInputs,
        ...calculations,
        savedAt: new Date().toLocaleDateString()
      };
      setProducts([...products, product]);
      
      // Reset calculator
      setCalcInputs({
        productName: '',
        category: 'LIQUOR CHOCOLATES',
        quantity: 6,
        ingredientCost: '',
        labourPercent: 30,
        packagingPercent: 16,
        manufacturingPercent: 11,
        marketingPercent: 11,
        logisticsPercent: 16,
        targetSellingPrice: '',
        targetMargin: 75
      });
    }
  };

  // Delete product
  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  // Get calculations for display
  const forwardCalc = calculatePricing(calcInputs);
  const reverseCalc = calculatorMode === 'price-to-cost' ? calculateReversePricing(calcInputs) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">ChocolatePro Pricing Calculator</div>
              <div className="ml-4 text-sm text-gray-600">Advanced Pricing Optimization Engine</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'calculator'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Pricing Calculator
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Saved Products
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'analysis'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Portfolio Analysis
          </button>
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            {/* Calculator Mode Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing Calculation Engine</h2>
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setCalculatorMode('cost-to-price')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    calculatorMode === 'cost-to-price'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  Cost → Price Calculator
                </button>
                <button
                  onClick={() => setCalculatorMode('price-to-cost')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    calculatorMode === 'price-to-cost'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  Price → Cost Calculator
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Panel */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {calculatorMode === 'cost-to-price' ? 'Product Cost Inputs' : 'Target Price Inputs'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={calcInputs.productName}
                      onChange={(e) => updateCalcInputs('productName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      placeholder="e.g., WHISKEY DARK CHOCO GANACHE"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={calcInputs.category}
                        onChange={(e) => updateCalcInputs('category', e.target.value)}
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
                        {boxCategories.includes(calcInputs.category) ? 'Box Quantity' : 'Pack Size'}
                      </label>
                      {boxCategories.includes(calcInputs.category) ? (
                        <select
                          value={calcInputs.quantity}
                          onChange={(e) => updateCalcInputs('quantity', parseInt(e.target.value))}
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
                          value={calcInputs.quantity}
                          onChange={(e) => updateCalcInputs('quantity', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="Individual / Jar"
                        />
                      )}
                    </div>
                  </div>

                  {calculatorMode === 'cost-to-price' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient Cost (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={calcInputs.ingredientCost}
                        onChange={(e) => updateCalcInputs('ingredientCost', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        placeholder="180"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Selling Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={calcInputs.targetSellingPrice}
                          onChange={(e) => updateCalcInputs('targetSellingPrice', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="1099"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Margin (%)</label>
                        <input
                          type="number"
                          value={calcInputs.targetMargin}
                          onChange={(e) => updateCalcInputs('targetMargin', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="75"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cost Components */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Cost Components (% of Ingredient Cost)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Labour (%)</label>
                        <input
                          type="number"
                          value={calcInputs.labourPercent}
                          onChange={(e) => updateCalcInputs('labourPercent', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Packaging (%)</label>
                        <input
                          type="number"
                          value={calcInputs.packagingPercent}
                          onChange={(e) => updateCalcInputs('packagingPercent', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing (%)</label>
                        <input
                          type="number"
                          value={calcInputs.manufacturingPercent}
                          onChange={(e) => updateCalcInputs('manufacturingPercent', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marketing (%)</label>
                        <input
                          type="number"
                          value={calcInputs.marketingPercent}
                          onChange={(e) => updateCalcInputs('marketingPercent', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logistics (%)</label>
                        <input
                          type="number"
                          value={calcInputs.logisticsPercent}
                          onChange={(e) => updateCalcInputs('logisticsPercent', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculation Results */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {calculatorMode === 'cost-to-price' ? 'Pricing Scenarios' : 'Cost Requirements'}
                </h3>

                {calculatorMode === 'cost-to-price' ? (
                  <div className="space-y-6">
                    {/* Cost Breakdown */}
                    {calcInputs.ingredientCost && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Ingredient: ₹{forwardCalc.ingredientCost.toFixed(0)}</div>
                          <div>Labour: ₹{forwardCalc.labour.toFixed(0)}</div>
                          <div>Packaging: ₹{forwardCalc.packaging.toFixed(0)}</div>
                          <div>Manufacturing: ₹{forwardCalc.manufacturing.toFixed(0)}</div>
                          <div>Marketing: ₹{forwardCalc.marketing.toFixed(0)}</div>
                          <div>Logistics: ₹{forwardCalc.logistics.toFixed(0)}</div>
                          <div className="font-bold text-lg text-amber-700 col-span-2 border-t pt-2">
                            Total Cost: ₹{forwardCalc.totalCost.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pricing Scenarios */}
                    {calcInputs.ingredientCost && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Smart Pricing Recommendations</h4>
                        {forwardCalc.scenarios.map((scenario) => (
                          <div key={scenario.margin} className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-lg">{scenario.margin}% Margin</span>
                              <span className="text-2xl font-bold text-green-600">₹{scenario.finalSellingPrice.toFixed(0)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Price before GST</div>
                                <div className="font-semibold">₹{scenario.sellingPriceBeforeGST.toFixed(0)}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">GST (18%)</div>
                                <div className="font-semibold">₹{scenario.gstAmount.toFixed(0)}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Profit Amount</div>
                                <div className="font-semibold text-green-600">₹{scenario.profitAmount.toFixed(0)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Reverse calculation results
                  <div className="space-y-6">
                    {calcInputs.targetSellingPrice && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-3">Target Price Breakdown</h4> 
                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                          <div>Final Selling Price: ₹{reverseCalc.targetFinalPrice.toFixed(0)}</div>  
                          <div>Price before GST: ₹{reverseCalc.sellingPriceBeforeGST.toFixed(0)}</div>
                          <div>GST (18%): ₹{reverseCalc.gstAmount.toFixed(0)}</div>
                          <div>Profit Amount: ₹{reverseCalc.profitAmount.toFixed(0)}</div>
                          <div className="font-bold col-span-2 border-t pt-2">
                            Required Total Cost: ₹{reverseCalc.requiredTotalCost.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    )}

                    {calcInputs.targetSellingPrice && (
                      <div className="bg-yellow-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-3">Maximum Allowable Costs</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Max Ingredient Cost: ₹{reverseCalc.maxIngredientCost.toFixed(0)}</div>
                          <div>Labour: ₹{reverseCalc.labour.toFixed(0)}</div>
                          <div>Packaging: ₹{reverseCalc.packaging.toFixed(0)}</div>
                          <div>Manufacturing: ₹{reverseCalc.manufacturing.toFixed(0)}</div>
                          <div>Marketing: ₹{reverseCalc.marketing.toFixed(0)}</div>
                          <div>Logistics: ₹{reverseCalc.logistics.toFixed(0)}</div>
                          <div className="font-bold text-amber-700 col-span-2 border-t pt-2">
                            Actual Margin: {reverseCalc.actualMargin.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Save Product Button */}
                {calcInputs.productName && (calcInputs.ingredientCost || calcInputs.targetSellingPrice) && (
                  <button
                    onClick={() => saveProduct(calculatorMode === 'cost-to-price' ? forwardCalc : reverseCalc)}
                    className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors mt-6"
                  >
                    Save Product Configuration
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Saved Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Product Configurations</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold">Product Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 font-semibold">Total Cost</th>
                    <th className="text-left py-3 px-4 font-semibold">Price before GST</th>
                    <th className="text-left py-3 px-4 font-semibold">GST (18%)</th>
                    <th className="text-left py-3 px-4 font-semibold">Final Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Margin</th>
                    <th className="text-left py-3 px-4 font-semibold">Saved</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-sm">{product.name}</td>
                      <td className="py-3 px-4 text-sm">{product.category}</td>
                      <td className="py-3 px-4 text-sm">
                        ₹{(product.totalCost || product.requiredTotalCost)?.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        ₹{(product.scenarios?.[2]?.sellingPriceBeforeGST || product.sellingPriceBeforeGST)?.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        ₹{(product.scenarios?.[2]?.gstAmount || product.gstAmount)?.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600">
                        ₹{(product.scenarios?.[2]?.finalSellingPrice || product.targetFinalPrice)?.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {(product.scenarios?.[2]?.margin || product.actualMargin)?.toFixed(0)}%
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{product.savedAt}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No products saved yet. Use the calculator to create and save product configurations.
                </div>
              )}
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
                    ? (products.reduce((sum, product) => 
                        sum + (product.scenarios?.[2]?.finalSellingPrice || product.targetFinalPrice || 0), 0) / products.length).toFixed(0)
                    : '0'}
                </div>
                <div className="text-gray-600">Avg Selling Price</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-blue-600">
                  {products.length > 0 
                    ? (products.reduce((sum, product) => 
                        sum + (product.scenarios?.[2]?.margin || product.actualMargin || 0), 0) / products.length).toFixed(0)
                    : 0}%
                </div>
                <div className="text-gray-600">Avg Profit Margin</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-purple-600">
                  ₹{products.length > 0 
                    ? (products.reduce((sum, product) => 
                        sum + (product.totalCost || product.requiredTotalCost || 0), 0) / products.length).toFixed(0)
                    : '0'}
                </div>
                <div className="text-gray-600">Avg Total Cost</div>
              </div>
            </div>

            {/* Category Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Performance Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productCategories.map((category) => {
                  const categoryProducts = products.filter(p => p.category === category);
                  const avgPrice = categoryProducts.length > 0 
                    ? categoryProducts.reduce((sum, p) => 
                        sum + (p.scenarios?.[2]?.finalSellingPrice || p.targetFinalPrice || 0), 0) / categoryProducts.length
                    : 0;
                  const avgMargin = categoryProducts.length > 0 
                    ? categoryProducts.reduce((sum, p) => 
                        sum + (p.scenarios?.[2]?.margin || p.actualMargin || 0), 0) / categoryProducts.length
                    : 0;
                  
                  return (
                    <div key={category} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">{category}</h3>
                      <div className="space-y-1 text-sm">
                        <div>Products: {categoryProducts.length}</div>
                        <div>Avg Price: ₹{avgPrice.toFixed(0)}</div>
                        <div>Avg Margin: {avgMargin.toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;