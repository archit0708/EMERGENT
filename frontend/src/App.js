import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [calculatorMode, setCalculatorMode] = useState('cost-to-price');
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Fixed cost structure
  const FIXED_COSTS = {
    labourPercent: 20,
    packagingAmount: 100,
    manufacturingPercent: 20,
    marketingPercent: 20,
    deliveryAmount: 100,
    gstPercent: 18
  };

  // Calculator inputs
  const [calcInputs, setCalcInputs] = useState({
    productName: '',
    category: 'LIQUOR CHOCOLATES',
    quantity: 6,
    ingredientCost: '',
    targetSellingPrice: '',
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
    const savedProducts = localStorage.getItem('chocolatePricing_products_v2');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save products
  useEffect(() => {
    localStorage.setItem('chocolatePricing_products_v2', JSON.stringify(products));
  }, [products]);

  // Core calculation engine - Forward calculation (Cost to Price)
  const calculatePricing = (inputs) => {
    const ingredientCost = parseFloat(inputs.ingredientCost) || 0;
    
    const labour = (ingredientCost * FIXED_COSTS.labourPercent) / 100;
    const packaging = FIXED_COSTS.packagingAmount;
    const manufacturing = (ingredientCost * FIXED_COSTS.manufacturingPercent) / 100;
    const marketing = (ingredientCost * FIXED_COSTS.marketingPercent) / 100;
    const delivery = FIXED_COSTS.deliveryAmount;
    
    const totalCost = ingredientCost + labour + packaging + manufacturing + marketing + delivery;
    
    // Multiple margin scenarios
    const scenarios = [60, 70, 75, 80, 85].map(margin => {
      const profitAmount = (totalCost * margin) / 100;
      const sellingPriceBeforeGST = totalCost + profitAmount;
      const gstAmount = (sellingPriceBeforeGST * FIXED_COSTS.gstPercent) / 100;
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
      delivery,
      totalCost,
      scenarios
    };
  };

  // Core calculation engine - Reverse calculation (Price to Cost)
  const calculateReversePricing = (inputs) => {
    const targetFinalPrice = parseFloat(inputs.targetSellingPrice) || 0;
    const targetMargin = inputs.targetMargin;
    
    // Remove GST to get price before GST
    const sellingPriceBeforeGST = targetFinalPrice / (1 + FIXED_COSTS.gstPercent / 100);
    const gstAmount = targetFinalPrice - sellingPriceBeforeGST;
    
    // Calculate required total cost based on target margin
    const requiredTotalCost = sellingPriceBeforeGST / (1 + targetMargin / 100);
    const profitAmount = sellingPriceBeforeGST - requiredTotalCost;
    
    // Back-calculate ingredient cost
    // Total Cost = Ingredient + Labour(20% of Ingredient) + Packaging(100) + Manufacturing(20% of Ingredient) + Marketing(20% of Ingredient) + Delivery(100)
    // Total Cost = Ingredient + 0.6*Ingredient + 200
    // Total Cost = 1.6*Ingredient + 200
    // Ingredient = (Total Cost - 200) / 1.6
    
    const fixedAmounts = FIXED_COSTS.packagingAmount + FIXED_COSTS.deliveryAmount;
    const variablePercent = FIXED_COSTS.labourPercent + FIXED_COSTS.manufacturingPercent + FIXED_COSTS.marketingPercent;
    
    const maxIngredientCost = (requiredTotalCost - fixedAmounts) / (1 + variablePercent / 100);
    
    // Calculate individual components
    const labour = (maxIngredientCost * FIXED_COSTS.labourPercent) / 100;
    const packaging = FIXED_COSTS.packagingAmount;
    const manufacturing = (maxIngredientCost * FIXED_COSTS.manufacturingPercent) / 100;
    const marketing = (maxIngredientCost * FIXED_COSTS.marketingPercent) / 100;
    const delivery = FIXED_COSTS.deliveryAmount;
    
    const calculatedTotalCost = maxIngredientCost + labour + packaging + manufacturing + marketing + delivery;
    
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
      delivery,
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
        targetSellingPrice: '',
        targetMargin: 75
      });
    }
  };

  // Update existing product
  const updateProduct = (id, updatedData) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, ...updatedData, updatedAt: new Date().toLocaleDateString() } : product
    ));
    setEditingProduct(null);
  };

  // Delete product
  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
    setEditingProduct(null);
  };

  // Start editing product
  const startEditingProduct = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      ingredientCost: product.ingredientCost || product.maxIngredientCost || '',
      targetMargin: 75
    });
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
              <div className="text-3xl font-bold text-gray-900">ChocolatePro Pricing Engine</div>
              <div className="ml-4 text-sm text-gray-600">Professional Cost & Pricing Calculator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Cost Structure Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 mb-2">Fixed Cost Structure</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>Labour: {FIXED_COSTS.labourPercent}% of ingredient</div>
            <div>Packaging: ₹{FIXED_COSTS.packagingAmount} fixed</div>
            <div>Manufacturing: {FIXED_COSTS.manufacturingPercent}% of ingredient</div>
            <div>Marketing: {FIXED_COSTS.marketingPercent}% of ingredient</div>
            <div>Delivery: ₹{FIXED_COSTS.deliveryAmount} fixed</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            onClick={() => setActiveTab('repository')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'repository'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Product Repository
          </button>
          <button
            onClick={() => setActiveTab('ratecard')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'ratecard'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Rate Card
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'analysis'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Analysis
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
                          <div>Labour (20%): ₹{forwardCalc.labour.toFixed(0)}</div>
                          <div>Packaging: ₹{forwardCalc.packaging.toFixed(0)}</div>
                          <div>Manufacturing (20%): ₹{forwardCalc.manufacturing.toFixed(0)}</div>
                          <div>Marketing (20%): ₹{forwardCalc.marketing.toFixed(0)}</div>
                          <div>Delivery: ₹{forwardCalc.delivery.toFixed(0)}</div>
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
                        {forwardCalc.scenarios.map((scenario, index) => (
                          <div key={scenario.margin} className={`bg-gradient-to-r p-4 rounded-lg border ${
                            index === 2 ? 'from-green-50 to-green-100 border-green-300' : 'from-blue-50 to-blue-100 border-blue-300'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-lg">
                                {scenario.margin}% Margin {index === 2 ? '(RECOMMENDED)' : ''}
                              </span>
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
                          <div>Labour (20%): ₹{reverseCalc.labour.toFixed(0)}</div>
                          <div>Packaging: ₹{reverseCalc.packaging.toFixed(0)}</div>
                          <div>Manufacturing (20%): ₹{reverseCalc.manufacturing.toFixed(0)}</div>
                          <div>Marketing (20%): ₹{reverseCalc.marketing.toFixed(0)}</div>
                          <div>Delivery: ₹{reverseCalc.delivery.toFixed(0)}</div>
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

        {/* Product Repository Tab */}
        {activeTab === 'repository' && (
          <div className="space-y-8">
            {/* Category-wise Product Repository */}
            {productCategories.map((category) => {
              const categoryProducts = products.filter(p => p.category === category);
              if (categoryProducts.length === 0) return null;
              
              return (
                <div key={category} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProducts.map((product) => {
                      const displayPrice = product.scenarios?.[2]?.finalSellingPrice || product.targetFinalPrice;
                      const displayMargin = product.scenarios?.[2]?.margin || product.actualMargin;
                      
                      return (
                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditingProduct(product)}
                                className="text-blue-500 hover:text-blue-700 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>Quantity: {boxCategories.includes(product.category) ? `Box of ${product.quantity}` : product.quantity}</div>
                            <div>Ingredient Cost: ₹{(product.ingredientCost || product.maxIngredientCost)?.toFixed(0)}</div>
                            <div>Total Cost: ₹{(product.totalCost || product.requiredTotalCost)?.toFixed(0)}</div>
                            <div className="font-semibold text-green-600">Final Price: ₹{displayPrice?.toFixed(0)}</div>
                            <div>Margin: {displayMargin?.toFixed(0)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {products.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-gray-500">
                  No products in repository yet. Use the calculator to create and save products.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rate Card Tab */}
        {activeTab === 'ratecard' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Official Rate Card</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 bg-gray-50">
                    <th className="text-left py-4 px-4 font-bold">Category</th>
                    <th className="text-left py-4 px-4 font-bold">Product Name</th>
                    <th className="text-left py-4 px-4 font-bold">Quantity</th>
                    <th className="text-left py-4 px-4 font-bold">Ingredient Cost</th>
                    <th className="text-left py-4 px-4 font-bold">Labour (20%)</th>
                    <th className="text-left py-4 px-4 font-bold">Packaging</th>
                    <th className="text-left py-4 px-4 font-bold">Manufacturing (20%)</th>
                    <th className="text-left py-4 px-4 font-bold">Marketing (20%)</th>
                    <th className="text-left py-4 px-4 font-bold">Delivery</th>
                    <th className="text-left py-4 px-4 font-bold bg-yellow-100">Total Cost</th>
                    <th className="text-left py-4 px-4 font-bold">Profit Margin</th>
                    <th className="text-left py-4 px-4 font-bold">Selling Price</th>
                    <th className="text-left py-4 px-4 font-bold">GST (18%)</th>
                    <th className="text-left py-4 px-4 font-bold bg-green-100">MRP</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const ingredientCost = product.ingredientCost || product.maxIngredientCost;
                    const labour = (ingredientCost * 20) / 100;
                    const manufacturing = (ingredientCost * 20) / 100;
                    const marketing = (ingredientCost * 20) / 100;
                    const totalCost = product.totalCost || product.requiredTotalCost;
                    const sellingPrice = product.scenarios?.[2]?.sellingPriceBeforeGST || product.sellingPriceBeforeGST;
                    const gst = product.scenarios?.[2]?.gstAmount || product.gstAmount;
                    const mrp = product.scenarios?.[2]?.finalSellingPrice || product.targetFinalPrice;
                    const margin = product.scenarios?.[2]?.margin || product.actualMargin;
                    
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{product.category}</td>
                        <td className="py-3 px-4 text-sm">{product.name}</td>
                        <td className="py-3 px-4 text-sm">{boxCategories.includes(product.category) ? `Box of ${product.quantity}` : product.quantity}</td>
                        <td className="py-3 px-4 text-sm">₹{ingredientCost?.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">₹{labour?.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">₹100</td>
                        <td className="py-3 px-4 text-sm">₹{manufacturing?.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">₹{marketing?.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">₹100</td>
                        <td className="py-3 px-4 text-sm font-semibold bg-yellow-50">₹{totalCost?.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">{margin?.toFixed(0)}%</td>
                        <td className="py-3 px-4 text-sm">₹{sellingPrice?.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm">₹{gst?.toFixed(0)}</td>
                        <td className="py-3 px-4 text-sm font-bold bg-green-50">₹{mrp?.toFixed(0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No products available for rate card. Create products first.
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
                  
                  if (categoryProducts.length === 0) return null;
                  
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient Cost (₹)</label>
                <input
                  type="number"
                  value={editingProduct.ingredientCost}
                  onChange={(e) => setEditingProduct({...editingProduct, ingredientCost: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    const updatedCalc = calculatePricing(editingProduct);
                    updateProduct(editingProduct.id, {...editingProduct, ...updatedCalc});
                  }}
                  className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;