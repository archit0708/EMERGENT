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
    targetMargin: 75,
    customProfitPercent: 75 // New field for cost-price mode
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
    const savedProducts = localStorage.getItem('chocolatePricing_products_v3');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save products
  useEffect(() => {
    localStorage.setItem('chocolatePricing_products_v3', JSON.stringify(products));
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

  // New: Cost-price calculator with custom profit margin
  const calculateCostPriceSelling = (inputs) => {
    const ingredientCost = parseFloat(inputs.ingredientCost) || 0;
    const customProfit = inputs.customProfitPercent || 75;
    
    const labour = (ingredientCost * FIXED_COSTS.labourPercent) / 100;
    const packaging = FIXED_COSTS.packagingAmount;
    const manufacturing = (ingredientCost * FIXED_COSTS.manufacturingPercent) / 100;
    const marketing = (ingredientCost * FIXED_COSTS.marketingPercent) / 100;
    const delivery = FIXED_COSTS.deliveryAmount;
    
    const totalCost = ingredientCost + labour + packaging + manufacturing + marketing + delivery;
    
    // Calculate with custom profit margin
    const profitAmount = (totalCost * customProfit) / 100;
    const sellingPriceBeforeGST = totalCost + profitAmount;
    const gstAmount = (sellingPriceBeforeGST * FIXED_COSTS.gstPercent) / 100;
    const finalSellingPrice = sellingPriceBeforeGST + gstAmount;
    
    // Smart recommendations based on industry standards
    const recommendations = [
      { margin: 60, label: 'Competitive', color: 'blue' },
      { margin: 70, label: 'Standard', color: 'green' },
      { margin: 75, label: 'Recommended', color: 'amber' },
      { margin: 80, label: 'Premium', color: 'purple' },
      { margin: 85, label: 'Luxury', color: 'pink' }
    ].map(rec => {
      const recProfitAmount = (totalCost * rec.margin) / 100;
      const recSellingPriceBeforeGST = totalCost + recProfitAmount;
      const recGstAmount = (recSellingPriceBeforeGST * FIXED_COSTS.gstPercent) / 100;
      const recFinalSellingPrice = recSellingPriceBeforeGST + recGstAmount;
      
      return {
        ...rec,
        profitAmount: recProfitAmount,
        sellingPriceBeforeGST: recSellingPriceBeforeGST,
        gstAmount: recGstAmount,
        finalSellingPrice: recFinalSellingPrice
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
      customProfit,
      profitAmount,
      sellingPriceBeforeGST,
      gstAmount,
      finalSellingPrice,
      recommendations
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
        targetMargin: 75,
        customProfitPercent: 75
      });
    }
  };

  // Update existing product with new calculations
  const updateProductFromEdit = (id, newInputs) => {
    const newCalc = calculateCostPriceSelling(newInputs);
    setProducts(products.map(product => 
      product.id === id ? { 
        ...product, 
        ...newInputs,
        ...newCalc,
        updatedAt: new Date().toLocaleDateString() 
      } : product
    ));
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
      customProfitPercent: product.customProfit || 75,
      labourPercent: FIXED_COSTS.labourPercent,
      packagingAmount: FIXED_COSTS.packagingAmount,
      manufacturingPercent: FIXED_COSTS.manufacturingPercent,
      marketingPercent: FIXED_COSTS.marketingPercent,
      deliveryAmount: FIXED_COSTS.deliveryAmount
    });
  };

  // Calculate edit preview
  const calculateEditPreview = (editData) => {
    if (!editData) return null;
    
    const ingredientCost = parseFloat(editData.ingredientCost) || 0;
    const labour = (ingredientCost * editData.labourPercent) / 100;
    const packaging = editData.packagingAmount;
    const manufacturing = (ingredientCost * editData.manufacturingPercent) / 100;
    const marketing = (ingredientCost * editData.marketingPercent) / 100;
    const delivery = editData.deliveryAmount;
    
    const totalCost = ingredientCost + labour + packaging + manufacturing + marketing + delivery;
    const profitAmount = (totalCost * editData.customProfitPercent) / 100;
    const sellingPriceBeforeGST = totalCost + profitAmount;
    const gstAmount = (sellingPriceBeforeGST * FIXED_COSTS.gstPercent) / 100;
    const finalSellingPrice = sellingPriceBeforeGST + gstAmount;
    
    return {
      ingredientCost,
      labour,
      packaging,
      manufacturing,
      marketing,
      delivery,
      totalCost,
      profitAmount,
      sellingPriceBeforeGST,
      gstAmount,
      finalSellingPrice,
      customProfit: editData.customProfitPercent
    };
  };

  // Get calculations for display
  const forwardCalc = calculatePricing(calcInputs);
  const costPriceCalc = calculatorMode === 'cost-price-selling' ? calculateCostPriceSelling(calcInputs) : null;
  const reverseCalc = calculatorMode === 'price-to-cost' ? calculateReversePricing(calcInputs) : null;
  const editPreview = calculateEditPreview(editingProduct);

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
              <div className="flex space-x-4 mb-6 flex-wrap">
                <button
                  onClick={() => setCalculatorMode('cost-to-price')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    calculatorMode === 'cost-to-price'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  Cost → Price Scenarios
                </button>
                <button
                  onClick={() => setCalculatorMode('cost-price-selling')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    calculatorMode === 'cost-price-selling'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  Cost → Selling Price
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
                  {calculatorMode === 'cost-to-price' ? 'Product Cost Inputs' : 
                   calculatorMode === 'cost-price-selling' ? 'Cost & Profit Inputs' :
                   'Target Price Inputs'}
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

                  {calculatorMode === 'cost-to-price' || calculatorMode === 'cost-price-selling' ? (
                    <div className="space-y-4">
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
                      {calculatorMode === 'cost-price-selling' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Profit Margin (%)</label>
                          <input
                            type="number"
                            value={calcInputs.customProfitPercent}
                            onChange={(e) => updateCalcInputs('customProfitPercent', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                            placeholder="75"
                          />
                        </div>
                      )}
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
                  {calculatorMode === 'cost-to-price' ? 'Pricing Scenarios' : 
                   calculatorMode === 'cost-price-selling' ? 'Selling Price & Recommendations' :
                   'Cost Requirements'}
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
                ) : calculatorMode === 'cost-price-selling' ? (
                  <div className="space-y-6">
                    {/* Cost Breakdown */}
                    {calcInputs.ingredientCost && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Ingredient: ₹{costPriceCalc.ingredientCost.toFixed(0)}</div>
                          <div>Labour (20%): ₹{costPriceCalc.labour.toFixed(0)}</div>
                          <div>Packaging: ₹{costPriceCalc.packaging.toFixed(0)}</div>
                          <div>Manufacturing (20%): ₹{costPriceCalc.manufacturing.toFixed(0)}</div>
                          <div>Marketing (20%): ₹{costPriceCalc.marketing.toFixed(0)}</div>
                          <div>Delivery: ₹{costPriceCalc.delivery.toFixed(0)}</div>
                          <div className="font-bold text-lg text-amber-700 col-span-2 border-t pt-2">
                            Total Cost: ₹{costPriceCalc.totalCost.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Margin Result */}
                    {calcInputs.ingredientCost && (
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-300">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-lg">Your {costPriceCalc.customProfit}% Margin</span>
                          <span className="text-3xl font-bold text-purple-600">₹{costPriceCalc.finalSellingPrice.toFixed(0)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Price before GST</div>
                            <div className="font-semibold">₹{costPriceCalc.sellingPriceBeforeGST.toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">GST (18%)</div>
                            <div className="font-semibold">₹{costPriceCalc.gstAmount.toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Profit Amount</div>
                            <div className="font-semibold text-purple-600">₹{costPriceCalc.profitAmount.toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Smart Recommendations */}
                    {calcInputs.ingredientCost && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Smart Recommendations</h4>
                        {costPriceCalc.recommendations.map((rec) => (
                          <div key={rec.margin} className={`bg-gradient-to-r p-3 rounded-lg border ${
                            rec.color === 'amber' ? 'from-amber-50 to-amber-100 border-amber-300' :
                            rec.color === 'green' ? 'from-green-50 to-green-100 border-green-300' :
                            rec.color === 'blue' ? 'from-blue-50 to-blue-100 border-blue-300' :
                            rec.color === 'purple' ? 'from-purple-50 to-purple-100 border-purple-300' :
                            'from-pink-50 to-pink-100 border-pink-300'
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {rec.margin}% - {rec.label}
                              </span>
                              <span className="font-bold text-lg">₹{rec.finalSellingPrice.toFixed(0)}</span>
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
                    onClick={() => saveProduct(
                      calculatorMode === 'cost-to-price' ? forwardCalc : 
                      calculatorMode === 'cost-price-selling' ? costPriceCalc : 
                      reverseCalc
                    )}
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
                  <div className="grid grid-cols-1 gap-6">
                    {categoryProducts.map((product) => {
                      const displayPrice = product.scenarios?.[2]?.finalSellingPrice || product.finalSellingPrice || product.targetFinalPrice;
                      const displayMargin = product.scenarios?.[2]?.margin || product.customProfit || product.actualMargin;
                      const ingredientCost = product.ingredientCost || product.maxIngredientCost;
                      
                      return (
                        <div key={product.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold text-gray-900 text-lg">{product.name}</h4>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => startEditingProduct(product)}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          {/* Detailed breakdown */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Quantity</div>
                              <div className="font-semibold">{boxCategories.includes(product.category) ? `Box of ${product.quantity}` : product.quantity}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Ingredient Cost</div>
                              <div className="font-semibold">₹{ingredientCost?.toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Total Cost</div>
                              <div className="font-semibold">₹{(product.totalCost || product.requiredTotalCost)?.toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Profit Margin</div>
                              <div className="font-semibold">{displayMargin?.toFixed(0)}%</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                            <div>
                              <div className="text-gray-600">Labour (20%)</div>
                              <div className="font-semibold">₹{((ingredientCost * 20) / 100)?.toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Packaging</div>
                              <div className="font-semibold">₹100</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Manufacturing (20%)</div>
                              <div className="font-semibold">₹{((ingredientCost * 20) / 100)?.toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Marketing (20%)</div>
                              <div className="font-semibold">₹{((ingredientCost * 20) / 100)?.toFixed(0)}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                            <div>
                              <div className="text-gray-600">Delivery</div>
                              <div className="font-semibold">₹100</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Price before GST</div>
                              <div className="font-semibold">₹{(product.scenarios?.[2]?.sellingPriceBeforeGST || product.sellingPriceBeforeGST)?.toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">GST (18%)</div>
                              <div className="font-semibold">₹{(product.scenarios?.[2]?.gstAmount || product.gstAmount)?.toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600 font-bold">Final Selling Price</div>
                              <div className="font-bold text-green-600 text-lg">₹{displayPrice?.toFixed(0)}</div>
                            </div>
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

        {/* Rate Card Tab - Simplified */}
        {activeTab === 'ratecard' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Official Rate Card</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 bg-gray-50">
                    <th className="text-left py-4 px-6 font-bold text-lg">Category</th>
                    <th className="text-left py-4 px-6 font-bold text-lg">Product Name</th>
                    <th className="text-left py-4 px-6 font-bold text-lg">Selling Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const displayPrice = product.scenarios?.[2]?.finalSellingPrice || product.finalSellingPrice || product.targetFinalPrice;
                    
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium text-base">{product.category}</td>
                        <td className="py-4 px-6 text-base">{product.name}</td>
                        <td className="py-4 px-6 font-bold text-lg text-green-600">₹{displayPrice?.toFixed(0)}</td>
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
                        sum + (product.scenarios?.[2]?.finalSellingPrice || product.finalSellingPrice || product.targetFinalPrice || 0), 0) / products.length).toFixed(0)
                    : '0'}
                </div>
                <div className="text-gray-600">Avg Selling Price</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-blue-600">
                  {products.length > 0 
                    ? (products.reduce((sum, product) => 
                        sum + (product.scenarios?.[2]?.margin || product.customProfit || product.actualMargin || 0), 0) / products.length).toFixed(0)
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
                        sum + (p.scenarios?.[2]?.finalSellingPrice || p.finalSellingPrice || p.targetFinalPrice || 0), 0) / categoryProducts.length
                    : 0;
                  const avgMargin = categoryProducts.length > 0 
                    ? categoryProducts.reduce((sum, p) => 
                        sum + (p.scenarios?.[2]?.margin || p.customProfit || p.actualMargin || 0), 0) / categoryProducts.length
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

      {/* Edit Product Modal - Enhanced */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-90vh overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Edit Product - All Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Inputs */}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profit Margin (%)</label>
                  <input
                    type="number"
                    value={editingProduct.customProfitPercent}
                    onChange={(e) => setEditingProduct({...editingProduct, customProfitPercent: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Labour (%)</label>
                  <input
                    type="number"
                    value={editingProduct.labourPercent}
                    onChange={(e) => setEditingProduct({...editingProduct, labourPercent: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Packaging (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.packagingAmount}
                    onChange={(e) => setEditingProduct({...editingProduct, packagingAmount: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturing (%)</label>
                  <input
                    type="number"
                    value={editingProduct.manufacturingPercent}
                    onChange={(e) => setEditingProduct({...editingProduct, manufacturingPercent: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marketing (%)</label>
                  <input
                    type="number"
                    value={editingProduct.marketingPercent}
                    onChange={(e) => setEditingProduct({...editingProduct, marketingPercent: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.deliveryAmount}
                    onChange={(e) => setEditingProduct({...editingProduct, deliveryAmount: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Column - Live Preview */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Live Preview</h4>
                {editPreview && (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ingredient Cost:</span>
                        <span className="font-semibold">₹{editPreview.ingredientCost.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labour ({editingProduct.labourPercent}%):</span>
                        <span className="font-semibold">₹{editPreview.labour.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Packaging:</span>
                        <span className="font-semibold">₹{editPreview.packaging.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Manufacturing ({editingProduct.manufacturingPercent}%):</span>
                        <span className="font-semibold">₹{editPreview.manufacturing.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marketing ({editingProduct.marketingPercent}%):</span>
                        <span className="font-semibold">₹{editPreview.marketing.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span className="font-semibold">₹{editPreview.delivery.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-bold">Total Cost:</span>
                        <span className="font-bold">₹{editPreview.totalCost.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit ({editingProduct.customProfitPercent}%):</span>
                        <span className="font-semibold text-green-600">₹{editPreview.profitAmount.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price before GST:</span>
                        <span className="font-semibold">₹{editPreview.sellingPriceBeforeGST.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span className="font-semibold">₹{editPreview.gstAmount.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-bold text-lg">Final Selling Price:</span>
                        <span className="font-bold text-lg text-green-600">₹{editPreview.finalSellingPrice.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  updateProductFromEdit(editingProduct.id, editingProduct);
                  setEditingProduct(null);
                }}
                className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700"
              >
                Update Product
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
      )}
    </div>
  );
};

export default App;