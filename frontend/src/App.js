import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Handle tab switching
  const handleTabClick = (tabName) => {
    console.log(`Tab clicked: ${tabName}`);
    setActiveTab(tabName);
  };
  
  // Debug activeTab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);
  const [calculatorMode, setCalculatorMode] = useState('cost-to-price');
  const [products, setProducts] = useState([]);
  const [hampers, setHampers] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingHamper, setEditingHamper] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Dynamic cost structure (now editable)
  const [costStructure, setCostStructure] = useState({
    labourPercent: 20,
    packagingAmount: 100,
    manufacturingPercent: 20,
    marketingPercent: 20,
    deliveryAmount: 100,
    gstPercent: 18
  });

  // Dynamic product categories (now editable)
  const [productCategories, setProductCategories] = useState([
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
  ]);

  // Hamper creation state
  const [newHamper, setNewHamper] = useState({
    occasionName: '',
    category: 'Gold', // Gold, Platinum, Luxe
    products: [],
    finalPrice: '',
    description: ''
  });

  const [selectedProductCategory, setSelectedProductCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);

  // Calculator inputs
  const [calcInputs, setCalcInputs] = useState({
    productName: '',
    category: 'LIQUOR CHOCOLATES',
    quantity: 6,
    ingredientCost: '',
    costPrice: '',
    targetSellingPrice: '',
    targetMargin: 75,
    customProfitPercent: 75
  });

  const boxCategories = ['LIQUOR CHOCOLATES', 'GANACHE', 'BON BON', 'TRUFFLES'];
  const quantityOptions = [6, 8, 12];
  const hamperCategories = ['Gold', 'Platinum', 'Luxe'];

  // Load saved data
  useEffect(() => {
    const savedProducts = localStorage.getItem('nolitaCacao_products_v1');
    const savedHampers = localStorage.getItem('nolitaCacao_hampers_v1');
    const savedCostStructure = localStorage.getItem('nolitaCacao_costStructure');
    const savedCategories = localStorage.getItem('nolitaCacao_categories');
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    if (savedHampers) {
      setHampers(JSON.parse(savedHampers));
    }
    if (savedCostStructure) {
      setCostStructure(JSON.parse(savedCostStructure));
    }
    if (savedCategories) {
      setProductCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('nolitaCacao_products_v1', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nolitaCacao_hampers_v1', JSON.stringify(hampers));
  }, [hampers]);

  useEffect(() => {
    localStorage.setItem('nolitaCacao_costStructure', JSON.stringify(costStructure));
  }, [costStructure]);

  useEffect(() => {
    localStorage.setItem('nolitaCacao_categories', JSON.stringify(productCategories));
  }, [productCategories]);

  // Update cost structure
  const updateCostStructure = (field, value) => {
    setCostStructure(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  // Category management functions
  const addCategory = () => {
    if (newCategoryName.trim() && !productCategories.includes(newCategoryName.trim().toUpperCase())) {
      setProductCategories([...productCategories, newCategoryName.trim().toUpperCase()]);
      setNewCategoryName('');
    }
  };

  const updateCategory = (oldName, newName) => {
    if (newName.trim() && newName.trim().toUpperCase() !== oldName) {
      const updatedCategories = productCategories.map(cat => 
        cat === oldName ? newName.trim().toUpperCase() : cat
      );
      setProductCategories(updatedCategories);
      
      // Update products with the old category
      setProducts(products.map(product => 
        product.category === oldName ? { ...product, category: newName.trim().toUpperCase() } : product
      ));
      
      setEditingCategory(null);
    }
  };

  const deleteCategory = (categoryName) => {
    if (productCategories.length > 1) { // Keep at least one category
      setProductCategories(productCategories.filter(cat => cat !== categoryName));
      
      // Remove products with this category or move them to first available category
      const firstAvailableCategory = productCategories.find(cat => cat !== categoryName);
      setProducts(products.map(product => 
        product.category === categoryName ? { ...product, category: firstAvailableCategory } : product
      ).filter(product => product.category !== categoryName || firstAvailableCategory));
    }
  };

  // Hamper management functions
  const addProductToHamper = () => {
    if (selectedProduct && productQuantity > 0) {
      const product = products.find(p => p.id === parseInt(selectedProduct));
      if (product) {
        const hamperProduct = {
          id: product.id,
          name: product.name,
          category: product.category,
          quantity: productQuantity,
          unitPrice: product.scenarios?.[2]?.finalSellingPrice || product.finalSellingPrice || product.targetFinalPrice || 0,
          totalPrice: (product.scenarios?.[2]?.finalSellingPrice || product.finalSellingPrice || product.targetFinalPrice || 0) * productQuantity
        };
        
        setNewHamper(prev => ({
          ...prev,
          products: [...prev.products, hamperProduct]
        }));
        
        setSelectedProduct('');
        setProductQuantity(1);
      }
    }
  };

  const removeProductFromHamper = (index) => {
    setNewHamper(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const calculateHamperCost = (hamperProducts) => {
    return hamperProducts.reduce((total, product) => total + product.totalPrice, 0);
  };

  const saveHamper = () => {
    if (newHamper.occasionName && newHamper.products.length > 0 && newHamper.finalPrice) {
      const totalCost = calculateHamperCost(newHamper.products);
      const hamper = {
        id: Date.now(),
        occasionName: newHamper.occasionName,
        category: newHamper.category,
        products: newHamper.products,
        totalCost: totalCost,
        finalPrice: parseFloat(newHamper.finalPrice),
        profitMargin: ((parseFloat(newHamper.finalPrice) - totalCost) / parseFloat(newHamper.finalPrice)) * 100,
        description: newHamper.description,
        createdAt: new Date().toLocaleDateString()
      };
      
      setHampers([...hampers, hamper]);
      
      // Reset form
      setNewHamper({
        occasionName: '',
        category: 'Gold',
        products: [],
        finalPrice: '',
        description: ''
      });
    }
  };

  const deleteHamper = (id) => {
    setHampers(hampers.filter(hamper => hamper.id !== id));
    setEditingHamper(null);
  };

  const getHamperRecommendations = (totalCost) => {
    const recommendations = [
      { 
        margin: 40, 
        label: 'Competitive', 
        price: totalCost / (1 - 0.40),
        maxDiscount: 15,
        color: 'blue' 
      },
      { 
        margin: 50, 
        label: 'Standard', 
        price: totalCost / (1 - 0.50),
        maxDiscount: 20,
        color: 'green' 
      },
      { 
        margin: 60, 
        label: 'Recommended', 
        price: totalCost / (1 - 0.60),
        maxDiscount: 25,
        color: 'amber' 
      },
      { 
        margin: 70, 
        label: 'Premium', 
        price: totalCost / (1 - 0.70),
        maxDiscount: 30,
        color: 'purple' 
      },
      { 
        margin: 75, 
        label: 'Luxury', 
        price: totalCost / (1 - 0.75),
        maxDiscount: 35,
        color: 'pink' 
      }
    ];
    
    return recommendations;
  };

  // Core calculation engines (existing code)
  const calculatePricing = (inputs) => {
    const ingredientCost = parseFloat(inputs.ingredientCost) || 0;
    
    const labour = (ingredientCost * costStructure.labourPercent) / 100;
    const packaging = costStructure.packagingAmount;
    const manufacturing = (ingredientCost * costStructure.manufacturingPercent) / 100;
    const marketing = (ingredientCost * costStructure.marketingPercent) / 100;
    const delivery = costStructure.deliveryAmount;
    
    const totalCost = ingredientCost + labour + packaging + manufacturing + marketing + delivery;
    
    const scenarios = [60, 70, 75, 80, 85].map(margin => {
      const profitAmount = (totalCost * margin) / 100;
      const sellingPriceBeforeGST = totalCost + profitAmount;
      const gstAmount = (sellingPriceBeforeGST * costStructure.gstPercent) / 100;
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

  const calculateCostToSelling = (inputs) => {
    const totalCostPrice = parseFloat(inputs.costPrice) || 0;
    const customProfit = inputs.customProfitPercent || 75;
    
    const profitAmount = (totalCostPrice * customProfit) / 100;
    const sellingPriceBeforeGST = totalCostPrice + profitAmount;
    const gstAmount = (sellingPriceBeforeGST * costStructure.gstPercent) / 100;
    const finalSellingPrice = sellingPriceBeforeGST + gstAmount;
    
    const recommendations = [
      { margin: 50, label: 'Basic', color: 'gray' },
      { margin: 60, label: 'Competitive', color: 'blue' },
      { margin: 70, label: 'Standard', color: 'green' },
      { margin: 75, label: 'Recommended', color: 'amber' },
      { margin: 80, label: 'Premium', color: 'purple' },
      { margin: 85, label: 'Luxury', color: 'pink' }
    ].map(rec => {
      const recProfitAmount = (totalCostPrice * rec.margin) / 100;
      const recSellingPriceBeforeGST = totalCostPrice + recProfitAmount;
      const recGstAmount = (recSellingPriceBeforeGST * costStructure.gstPercent) / 100;
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
      totalCostPrice,
      customProfit,
      profitAmount,
      sellingPriceBeforeGST,
      gstAmount,
      finalSellingPrice,
      recommendations
    };
  };

  const calculateCostTargetAnalysis = (inputs) => {
    const totalCostPrice = parseFloat(inputs.costPrice) || 0;
    const targetFinalPrice = parseFloat(inputs.targetSellingPrice) || 0;
    
    if (totalCostPrice === 0 || targetFinalPrice === 0) {
      return null;
    }
    
    const targetPriceBeforeGST = targetFinalPrice / (1 + costStructure.gstPercent / 100);
    const gstAmount = targetFinalPrice - targetPriceBeforeGST;
    
    const profitAmount = targetPriceBeforeGST - totalCostPrice;
    const actualMargin = (profitAmount / totalCostPrice) * 100;
    
    let analysis = '';
    let analysisColor = '';
    
    if (actualMargin < 0) {
      analysis = 'LOSS - Target price too low';
      analysisColor = 'red';
    } else if (actualMargin < 30) {
      analysis = 'Very Low Margin - Not sustainable';
      analysisColor = 'red';
    } else if (actualMargin < 50) {
      analysis = 'Low Margin - Consider increasing price';
      analysisColor = 'orange';
    } else if (actualMargin < 70) {
      analysis = 'Good Margin - Competitive pricing';
      analysisColor = 'green';
    } else if (actualMargin < 85) {
      analysis = 'Excellent Margin - Premium positioning';
      analysisColor = 'blue';
    } else {
      analysis = 'Luxury Margin - High-end market';
      analysisColor = 'purple';
    }
    
    return {
      totalCostPrice,
      targetFinalPrice,
      targetPriceBeforeGST,
      gstAmount,
      profitAmount,
      actualMargin,
      analysis,
      analysisColor
    };
  };

  const calculateReversePricing = (inputs) => {
    const targetFinalPrice = parseFloat(inputs.targetSellingPrice) || 0;
    const targetMargin = inputs.targetMargin;
    
    const sellingPriceBeforeGST = targetFinalPrice / (1 + costStructure.gstPercent / 100);
    const gstAmount = targetFinalPrice - sellingPriceBeforeGST;
    
    const requiredTotalCost = sellingPriceBeforeGST / (1 + targetMargin / 100);
    const profitAmount = sellingPriceBeforeGST - requiredTotalCost;
    
    const fixedAmounts = costStructure.packagingAmount + costStructure.deliveryAmount;
    const variablePercent = costStructure.labourPercent + costStructure.manufacturingPercent + costStructure.marketingPercent;
    
    const maxIngredientCost = (requiredTotalCost - fixedAmounts) / (1 + variablePercent / 100);
    
    const labour = (maxIngredientCost * costStructure.labourPercent) / 100;
    const packaging = costStructure.packagingAmount;
    const manufacturing = (maxIngredientCost * costStructure.manufacturingPercent) / 100;
    const marketing = (maxIngredientCost * costStructure.marketingPercent) / 100;
    const delivery = costStructure.deliveryAmount;
    
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
        calculatorMode: calculatorMode,
        costStructureSnapshot: { ...costStructure },
        ...calcInputs,
        ...calculations,
        savedAt: new Date().toLocaleDateString()
      };
      setProducts([...products, product]);
      
      setCalcInputs({
        productName: '',
        category: productCategories[0] || '',
        quantity: 6,
        ingredientCost: '',
        costPrice: '',
        targetSellingPrice: '',
        targetMargin: 75,
        customProfitPercent: 75
      });
    }
  };

  // Update existing product with new calculations
  const updateProductFromEdit = (id, newInputs) => {
    const newCalc = calculateCostToSelling(newInputs);
    setProducts(products.map(product => 
      product.id === id ? { 
        ...product, 
        ...newInputs,
        ...newCalc,
        costStructureSnapshot: { ...costStructure },
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
      costPrice: product.totalCostPrice || '',
      customProfitPercent: product.customProfit || 75,
      labourPercent: costStructure.labourPercent,
      packagingAmount: costStructure.packagingAmount,
      manufacturingPercent: costStructure.manufacturingPercent,
      marketingPercent: costStructure.marketingPercent,
      deliveryAmount: costStructure.deliveryAmount
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
    const gstAmount = (sellingPriceBeforeGST * costStructure.gstPercent) / 100;
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
  const costToSellingCalc = calculatorMode === 'cost-to-selling' ? calculateCostToSelling(calcInputs) : null;
  const costTargetCalc = calculatorMode === 'cost-target-analysis' ? calculateCostTargetAnalysis(calcInputs) : null;
  const reverseCalc = calculatorMode === 'price-to-cost' ? calculateReversePricing(calcInputs) : null;
  const editPreview = calculateEditPreview(editingProduct);

  // Get filtered products for hamper creation
  const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category);
  };

  const hamperCost = calculateHamperCost(newHamper.products);
  const hamperRecommendations = hamperCost > 0 ? getHamperRecommendations(hamperCost) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">Nolita Cacao Calculator- TSL</div>
              <div className="ml-4 text-sm text-gray-600">Professional Cost & Pricing Calculator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Cost Structure Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-amber-800">Cost Structure Settings</h3>
            <span className="text-xs text-amber-600">Changes apply to all new calculations</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div>
              <label className="block text-xs text-amber-700">Labour (%)</label>
              <input
                type="number"
                value={costStructure.labourPercent}
                onChange={(e) => updateCostStructure('labourPercent', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-amber-700">Packaging (₹)</label>
              <input
                type="number"
                value={costStructure.packagingAmount}
                onChange={(e) => updateCostStructure('packagingAmount', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-amber-700">Manufacturing (%)</label>
              <input
                type="number"
                value={costStructure.manufacturingPercent}
                onChange={(e) => updateCostStructure('manufacturingPercent', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-amber-700">Marketing (%)</label>
              <input
                type="number"
                value={costStructure.marketingPercent}
                onChange={(e) => updateCostStructure('marketingPercent', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-amber-700">Delivery (₹)</label>
              <input
                type="number"
                value={costStructure.deliveryAmount}
                onChange={(e) => updateCostStructure('deliveryAmount', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-amber-700">GST (%)</label>
              <input
                type="number"
                value={costStructure.gstPercent}
                onChange={(e) => updateCostStructure('gstPercent', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4 mb-8 flex-wrap">
          <button
            onClick={() => handleTabClick('calculator')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'calculator'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Pricing Calculator
          </button>
          <button
            onClick={() => handleTabClick('repository')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'repository'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Product Repository
          </button>
          <button
            id="hamperTabButton"
            onClick={() => handleTabClick('hampers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'hampers'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Hamper Curation
          </button>
          <button
            onClick={() => handleTabClick('categories')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Category Management
          </button>
          <button
            onClick={() => handleTabClick('ratecard')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'ratecard'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Rate Card
          </button>
          <button
            onClick={() => handleTabClick('analysis')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'analysis'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            Analysis
          </button>
        </div>

        {/* Hampers Tab */}
        {activeTab === 'hampers' && (
          <div className="space-y-8" id="hamperContent">
            {/* Create New Hamper */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Custom Hamper</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Hamper Details */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occasion Name</label>
                      <input
                        type="text"
                        value={newHamper.occasionName}
                        onChange={(e) => setNewHamper({...newHamper, occasionName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        placeholder="e.g., Diwali, Valentine's Day"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={newHamper.category}
                        onChange={(e) => setNewHamper({...newHamper, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      >
                        {hamperCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={newHamper.description}
                      onChange={(e) => setNewHamper({...newHamper, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      rows={3}
                      placeholder="Describe the hamper theme or special features..."
                    />
                  </div>

                  {/* Add Products Section */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Add Products to Hamper</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
                        <select
                          value={selectedProductCategory}
                          onChange={(e) => {
                            setSelectedProductCategory(e.target.value);
                            setSelectedProduct('');
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        >
                          <option value="">Select Category</option>
                          {productCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                        <select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          disabled={!selectedProductCategory}
                        >
                          <option value="">Select Product</option>
                          {getProductsByCategory(selectedProductCategory).map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addProductToHamper}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Add Product to Hamper
                    </button>
                  </div>

                  {/* Selected Products List */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Selected Products</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {newHamper.products.map((product, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              {product.category} - Qty: {product.quantity} - ₹{product.unitPrice.toFixed(0)} each
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-semibold text-green-600">₹{product.totalPrice.toFixed(0)}</span>
                            <button
                              onClick={() => removeProductFromHamper(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      {newHamper.products.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          No products added yet. Select products from above.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Final Price Input */}
                  {hamperCost > 0 && (
                    <div className="border-t pt-6">
                      <div className="bg-amber-50 p-4 rounded-lg mb-4">
                        <div className="font-semibold text-amber-800">
                          Total Product Cost: ₹{hamperCost.toFixed(0)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Final Hamper Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newHamper.finalPrice}
                          onChange={(e) => setNewHamper({...newHamper, finalPrice: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="Enter final selling price"
                        />
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  {newHamper.occasionName && newHamper.products.length > 0 && newHamper.finalPrice && (
                    <button
                      onClick={saveHamper}
                      className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                    >
                      Save Hamper
                    </button>
                  )}
                </div>

                {/* Right Column - Smart Recommendations */}
                <div className="space-y-6">
                  {hamperCost > 0 && (
                    <div className="bg-white border rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Smart Pricing Recommendations</h3>
                      <div className="space-y-4">
                        {hamperRecommendations.map((rec) => (
                          <div key={rec.margin} className={`bg-gradient-to-r p-4 rounded-lg border ${
                            rec.color === 'amber' ? 'from-amber-50 to-amber-100 border-amber-300' :
                            rec.color === 'green' ? 'from-green-50 to-green-100 border-green-300' :
                            rec.color === 'blue' ? 'from-blue-50 to-blue-100 border-blue-300' :
                            rec.color === 'purple' ? 'from-purple-50 to-purple-100 border-purple-300' :
                            'from-pink-50 to-pink-100 border-pink-300'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-lg">
                                {rec.margin}% Margin - {rec.label}
                              </span>
                              <span className="text-xl font-bold">₹{rec.price.toFixed(0)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Product Cost</div>
                                <div className="font-semibold">₹{hamperCost.toFixed(0)}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Max Discount</div>
                                <div className="font-semibold text-red-600">{rec.maxDiscount}%</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {newHamper.finalPrice && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Your Pricing Analysis</h4>
                          <div className="text-sm space-y-1">
                            <div>Final Price: ₹{parseFloat(newHamper.finalPrice).toFixed(0)}</div>
                            <div>Cost: ₹{hamperCost.toFixed(0)}</div>
                            <div>Profit: ₹{(parseFloat(newHamper.finalPrice) - hamperCost).toFixed(0)}</div>
                            <div className="font-semibold">
                              Margin: {(((parseFloat(newHamper.finalPrice) - hamperCost) / parseFloat(newHamper.finalPrice)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Existing Hampers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Created Hampers</h2>
              
              {/* Group hampers by occasion */}
              {Object.entries(
                hampers.reduce((acc, hamper) => {
                  if (!acc[hamper.occasionName]) {
                    acc[hamper.occasionName] = {};
                  }
                  if (!acc[hamper.occasionName][hamper.category]) {
                    acc[hamper.occasionName][hamper.category] = [];
                  }
                  acc[hamper.occasionName][hamper.category].push(hamper);
                  return acc;
                }, {})
              ).map(([occasion, categories]) => (
                <div key={occasion} className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{occasion}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {hamperCategories.map((categoryName) => {
                      const categoryHampers = categories[categoryName] || [];
                      return (
                        <div key={categoryName} className="border rounded-lg p-4">
                          <h4 className={`font-semibold mb-3 ${
                            categoryName === 'Gold' ? 'text-yellow-600' :
                            categoryName === 'Platinum' ? 'text-gray-600' :
                            'text-purple-600'
                          }`}>
                            {categoryName} Collection
                          </h4>
                          {categoryHampers.length > 0 ? (
                            categoryHampers.map((hamper) => (
                              <div key={hamper.id} className="bg-gray-50 p-3 rounded mb-3">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-medium text-gray-900">
                                    {hamper.products.length} Items
                                  </div>
                                  <button
                                    onClick={() => deleteHamper(hamper.id)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    Delete
                                  </button>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div>Cost: ₹{hamper.totalCost.toFixed(0)}</div>
                                  <div>Price: ₹{hamper.finalPrice.toFixed(0)}</div>
                                  <div>Margin: {hamper.profitMargin.toFixed(1)}%</div>
                                  <div className="text-xs">
                                    {hamper.products.map(p => p.name).join(', ')}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 text-sm">
                              No {categoryName.toLowerCase()} hampers created yet
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {hampers.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No hampers created yet. Create your first hamper above!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            {/* Calculator Mode Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing Calculation Engine</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => setCalculatorMode('cost-to-price')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm ${
                    calculatorMode === 'cost-to-price'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  Ingredient → Price Scenarios
                </button>
                <button
                  onClick={() => setCalculatorMode('cost-to-selling')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm ${
                    calculatorMode === 'cost-to-selling'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  Cost Price → Selling Price
                </button>
                <button
                  onClick={() => setCalculatorMode('cost-target-analysis')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm ${
                    calculatorMode === 'cost-target-analysis'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                  }`}
                >
                  Cost + Target Analysis
                </button>
                <button
                  onClick={() => setCalculatorMode('price-to-cost')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm ${
                    calculatorMode === 'price-to-cost'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  Target Price → Max Cost
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Panel */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {calculatorMode === 'cost-to-price' ? 'Ingredient Cost Inputs' : 
                   calculatorMode === 'cost-to-selling' ? 'Cost Price & Profit Inputs' :
                   calculatorMode === 'cost-target-analysis' ? 'Cost Price & Target Price' :
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
                  ) : calculatorMode === 'cost-to-selling' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={calcInputs.costPrice}
                          onChange={(e) => updateCalcInputs('costPrice', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter your total cost including all components</p>
                      </div>
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
                    </div>
                  ) : calculatorMode === 'cost-target-analysis' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={calcInputs.costPrice}
                          onChange={(e) => updateCalcInputs('costPrice', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Selling Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={calcInputs.targetSellingPrice}
                          onChange={(e) => updateCalcInputs('targetSellingPrice', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="1000"
                        />
                      </div>
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
                   calculatorMode === 'cost-to-selling' ? 'Selling Price & Recommendations' :
                   calculatorMode === 'cost-target-analysis' ? 'Margin Analysis' :
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
                          <div>Labour ({costStructure.labourPercent}%): ₹{forwardCalc.labour.toFixed(0)}</div>
                          <div>Packaging: ₹{forwardCalc.packaging.toFixed(0)}</div>
                          <div>Manufacturing ({costStructure.manufacturingPercent}%): ₹{forwardCalc.manufacturing.toFixed(0)}</div>
                          <div>Marketing ({costStructure.marketingPercent}%): ₹{forwardCalc.marketing.toFixed(0)}</div>
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
                                <div className="text-gray-600">GST ({costStructure.gstPercent}%)</div>
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
                ) : calculatorMode === 'cost-to-selling' ? (
                  <div className="space-y-6">
                    {/* Custom Margin Result */}
                    {calcInputs.costPrice && (
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-300">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-lg">Your {costToSellingCalc.customProfit}% Margin</span>
                          <span className="text-3xl font-bold text-purple-600">₹{costToSellingCalc.finalSellingPrice.toFixed(0)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Total Cost</div>
                            <div className="font-semibold">₹{costToSellingCalc.totalCostPrice.toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Profit Amount</div>
                            <div className="font-semibold text-purple-600">₹{costToSellingCalc.profitAmount.toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Price before GST</div>
                            <div className="font-semibold">₹{costToSellingCalc.sellingPriceBeforeGST.toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">GST ({costStructure.gstPercent}%)</div>
                            <div className="font-semibold">₹{costToSellingCalc.gstAmount.toFixed(0)}</div>
                          </div>
                          <div className="font-bold text-purple-700 text-center col-span-2">
                            Final Selling Price: ₹{costToSellingCalc.finalSellingPrice.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Smart Recommendations */}
                    {calcInputs.costPrice && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Smart Recommendations</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {costToSellingCalc.recommendations.map((rec) => (
                            <div key={rec.margin} className={`bg-gradient-to-r p-3 rounded-lg border ${
                              rec.color === 'amber' ? 'from-amber-50 to-amber-100 border-amber-300' :
                              rec.color === 'green' ? 'from-green-50 to-green-100 border-green-300' :
                              rec.color === 'blue' ? 'from-blue-50 to-blue-100 border-blue-300' :
                              rec.color === 'purple' ? 'from-purple-50 to-purple-100 border-purple-300' :
                              rec.color === 'pink' ? 'from-pink-50 to-pink-100 border-pink-300' :
                              'from-gray-50 to-gray-100 border-gray-300'
                            }`}>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-sm">
                                  {rec.margin}% - {rec.label}
                                </span>
                                <span className="font-bold">₹{rec.finalSellingPrice.toFixed(0)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : calculatorMode === 'cost-target-analysis' ? (
                  <div className="space-y-6">
                    {costTargetCalc && (
                      <div className={`bg-gradient-to-r p-4 rounded-lg border ${
                        costTargetCalc.analysisColor === 'red' ? 'from-red-50 to-red-100 border-red-300' :
                        costTargetCalc.analysisColor === 'orange' ? 'from-orange-50 to-orange-100 border-orange-300' :
                        costTargetCalc.analysisColor === 'green' ? 'from-green-50 to-green-100 border-green-300' :
                        costTargetCalc.analysisColor === 'blue' ? 'from-blue-50 to-blue-100 border-blue-300' :
                        'from-purple-50 to-purple-100 border-purple-300'
                      }`}>
                        <h4 className="font-semibold text-gray-900 mb-3">Margin Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Actual Margin:</span>
                            <span className="text-2xl font-bold">{costTargetCalc.actualMargin.toFixed(1)}%</span>
                          </div>
                          <div className={`text-center font-bold text-lg ${
                            costTargetCalc.analysisColor === 'red' ? 'text-red-700' :
                            costTargetCalc.analysisColor === 'orange' ? 'text-orange-700' :
                            costTargetCalc.analysisColor === 'green' ? 'text-green-700' :
                            costTargetCalc.analysisColor === 'blue' ? 'text-blue-700' :
                            'text-purple-700'
                          }`}>
                            {costTargetCalc.analysis}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
                            <div>
                              <div className="text-gray-600">Cost Price</div>
                              <div className="font-semibold">₹{costTargetCalc.totalCostPrice.toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Target Price</div>
                              <div className="font-semibold">₹{costTargetCalc.targetFinalPrice.toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Price before GST</div>
                              <div className="font-semibold">₹{costTargetCalc.targetPriceBeforeGST.toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">GST ({costStructure.gstPercent}%)</div>
                              <div className="font-semibold">₹{costTargetCalc.gstAmount.toFixed(0)}</div>
                            </div>
                            <div className="col-span-2">
                              <div className="text-gray-600">Profit Amount</div>
                              <div className="font-semibold text-green-600">₹{costTargetCalc.profitAmount.toFixed(0)}</div>
                            </div>
                          </div>
                        </div>
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
                          <div>GST ({costStructure.gstPercent}%): ₹{reverseCalc.gstAmount.toFixed(0)}</div>
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
                          <div>Labour ({costStructure.labourPercent}%): ₹{reverseCalc.labour.toFixed(0)}</div>
                          <div>Packaging: ₹{reverseCalc.packaging.toFixed(0)}</div>
                          <div>Manufacturing ({costStructure.manufacturingPercent}%): ₹{reverseCalc.manufacturing.toFixed(0)}</div>
                          <div>Marketing ({costStructure.marketingPercent}%): ₹{reverseCalc.marketing.toFixed(0)}</div>
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
                {calcInputs.productName && (calcInputs.ingredientCost || calcInputs.costPrice || calcInputs.targetSellingPrice) && (
                  <button
                    onClick={() => saveProduct(
                      calculatorMode === 'cost-to-price' ? forwardCalc : 
                      calculatorMode === 'cost-to-selling' ? costToSellingCalc :
                      calculatorMode === 'cost-target-analysis' ? costTargetCalc :
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

        {/* Other tabs remain the same... */}
        {/* Category Management Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            {/* Add New Category */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Management</h2>
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                />
                <button
                  onClick={addCategory}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Add Category
                </button>
              </div>
            </div>

            {/* Existing Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Existing Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productCategories.map((category) => (
                  <div key={category} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {editingCategory === category ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          defaultValue={category}
                          onBlur={(e) => updateCategory(category, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateCategory(category, e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="text-sm bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-gray-900">{category}</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            {productCategories.length > 1 && (
                              <button
                                onClick={() => deleteCategory(category)}
                                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Products: {products.filter(p => p.category === category).length}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
                      const totalCost = product.totalCost || product.totalCostPrice || product.requiredTotalCost;
                      
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
                          
                          {/* Show different layouts based on calculator mode used */}
                          {product.calculatorMode === 'cost-to-selling' || product.calculatorMode === 'cost-target-analysis' ? (
                            // For cost price based products
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Quantity</div>
                                <div className="font-semibold">{boxCategories.includes(product.category) ? `Box of ${product.quantity}` : product.quantity}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Total Cost Price</div>
                                <div className="font-semibold">₹{product.totalCostPrice?.toFixed(0) || totalCost?.toFixed(0)}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Profit Margin</div>
                                <div className="font-semibold">{displayMargin?.toFixed(0)}%</div>
                              </div>
                              <div>
                                <div className="text-gray-600 font-bold">Final Selling Price</div>
                                <div className="font-bold text-green-600 text-lg">₹{displayPrice?.toFixed(0)}</div>
                              </div>
                            </div>
                          ) : (
                            // For ingredient cost based products
                            <>
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
                                  <div className="font-semibold">₹{totalCost?.toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Profit Margin</div>
                                  <div className="font-semibold">{displayMargin?.toFixed(0)}%</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                                <div>
                                  <div className="text-gray-600">Labour ({costStructure.labourPercent}%)</div>
                                  <div className="font-semibold">₹{((ingredientCost * costStructure.labourPercent) / 100)?.toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Packaging</div>
                                  <div className="font-semibold">₹{costStructure.packagingAmount}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Manufacturing ({costStructure.manufacturingPercent}%)</div>
                                  <div className="font-semibold">₹{((ingredientCost * costStructure.manufacturingPercent) / 100)?.toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Marketing ({costStructure.marketingPercent}%)</div>
                                  <div className="font-semibold">₹{((ingredientCost * costStructure.marketingPercent) / 100)?.toFixed(0)}</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                                <div>
                                  <div className="text-gray-600">Delivery</div>
                                  <div className="font-semibold">₹{costStructure.deliveryAmount}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Price before GST</div>
                                  <div className="font-semibold">₹{(product.scenarios?.[2]?.sellingPriceBeforeGST || product.sellingPriceBeforeGST)?.toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">GST ({costStructure.gstPercent}%)</div>
                                  <div className="font-semibold">₹{(product.scenarios?.[2]?.gstAmount || product.gstAmount)?.toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600 font-bold">Final Selling Price</div>
                                  <div className="font-bold text-green-600 text-lg">₹{displayPrice?.toFixed(0)}</div>
                                </div>
                              </div>
                            </>
                          )}
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
                        sum + (product.totalCost || product.totalCostPrice || product.requiredTotalCost || 0), 0) / products.length).toFixed(0)
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

            {/* Hamper Analysis */}
            {hampers.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Hamper Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{hampers.length}</div>
                    <div className="text-yellow-700">Total Hampers</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{(hampers.reduce((sum, h) => sum + h.finalPrice, 0) / hampers.length).toFixed(0)}
                    </div>
                    <div className="text-green-700">Avg Hamper Price</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(hampers.reduce((sum, h) => sum + h.profitMargin, 0) / hampers.length).toFixed(1)}%
                    </div>
                    <div className="text-blue-700">Avg Margin</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ₹{(hampers.reduce((sum, h) => sum + h.totalCost, 0) / hampers.length).toFixed(0)}
                    </div>
                    <div className="text-purple-700">Avg Cost</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {hamperCategories.map((category) => {
                    const categoryHampers = hampers.filter(h => h.category === category);
                    if (categoryHampers.length === 0) return null;
                    
                    const avgPrice = categoryHampers.reduce((sum, h) => sum + h.finalPrice, 0) / categoryHampers.length;
                    const avgMargin = categoryHampers.reduce((sum, h) => sum + h.profitMargin, 0) / categoryHampers.length;
                    
                    return (
                      <div key={category} className={`p-4 rounded-lg border-2 ${
                        category === 'Gold' ? 'border-yellow-300 bg-yellow-50' :
                        category === 'Platinum' ? 'border-gray-300 bg-gray-50' :
                        'border-purple-300 bg-purple-50'
                      }`}>
                        <h3 className={`font-semibold mb-2 ${
                          category === 'Gold' ? 'text-yellow-700' :
                          category === 'Platinum' ? 'text-gray-700' :
                          'text-purple-700'
                        }`}>
                          {category} Hampers
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div>Count: {categoryHampers.length}</div>
                          <div>Avg Price: ₹{avgPrice.toFixed(0)}</div>
                          <div>Avg Margin: {avgMargin.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
                        <span>GST ({costStructure.gstPercent}%):</span>
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