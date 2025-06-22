import React, { useState, useEffect } from 'react';
import './App.css';
import {
  costStructureAPI,
  categoriesAPI,
  productsAPI,
  hampersAPI,
  initializeData
} from './services/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [calculatorMode, setCalculatorMode] = useState('cost-to-price');
  const [products, setProducts] = useState([]);
  const [hampers, setHampers] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingHamper, setEditingHamper] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Debug activeTab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  // Simple tab click handler
  const handleTabClick = (tabName) => {
    console.log('Tab clicked:', tabName);
    console.log('DEPLOYMENT TEST: Tab click handler called at', new Date().toLocaleTimeString());
    setActiveTab(tabName);
  };
  
  // Dynamic cost structure (now from API)
  const [costStructure, setCostStructure] = useState({
    labourPercent: 20,
    packagingAmount: 80,      // Updated from 100
    manufacturingPercent: 20,
    marketingPercent: 20,
    deliveryAmount: 80,       // Updated from 100
    gstPercent: 18
  });

  // Dynamic product categories (now from API)
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

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await initializeData();
        
        setCostStructure(data.costStructure);
        setProductCategories(data.categories);
        setProducts(data.products);
        setHampers(data.hampers);
      } catch (err) {
        setError('Failed to load data from server. Please refresh the page.');
        console.error('Data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  // Update cost structure (now uses API)
  const updateCostStructure = async (field, value) => {
    const newCostStructure = { ...costStructure, [field]: parseFloat(value) || 0 };
    setCostStructure(newCostStructure);
    
    try {
      await costStructureAPI.update(newCostStructure);
    } catch (error) {
      console.error('Failed to update cost structure:', error);
      setError('Failed to save cost structure changes');
    }
  };

  // Category management functions (now use API)
  const addCategory = async () => {
    if (newCategoryName.trim() && !productCategories.includes(newCategoryName.trim().toUpperCase())) {
      try {
        await categoriesAPI.add(newCategoryName.trim());
        const updatedCategories = await categoriesAPI.getAll();
        setProductCategories(updatedCategories);
        setNewCategoryName('');
      } catch (error) {
        console.error('Failed to add category:', error);
        setError('Failed to add category');
      }
    }
  };

  const updateCategory = async (oldName, newName) => {
    if (newName.trim() && newName.trim().toUpperCase() !== oldName) {
      try {
        await categoriesAPI.update(oldName, newName.trim());
        const [updatedCategories, updatedProducts] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll()
        ]);
        setProductCategories(updatedCategories);
        setProducts(updatedProducts);
        setEditingCategory(null);
      } catch (error) {
        console.error('Failed to update category:', error);
        setError('Failed to update category');
      }
    }
  };

  const deleteCategory = async (categoryName) => {
    if (productCategories.length > 1) {
      try {
        await categoriesAPI.delete(categoryName);
        const [updatedCategories, updatedProducts] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll()
        ]);
        setProductCategories(updatedCategories);
        setProducts(updatedProducts);
      } catch (error) {
        console.error('Failed to delete category:', error);
        setError('Failed to delete category');
      }
    }
  };

  // Hamper management functions - Fixed product selection
  const addProductToHamper = () => {
    if (selectedProduct && productQuantity > 0) {
      console.log('Adding product to hamper:', selectedProduct, productQuantity);
      console.log('Available products:', products.length);
      
      const product = products.find(p => p.id === selectedProduct);
      console.log('Found product:', product);
      
      if (product) {
        const unitPrice = product.finalSellingPrice || product.totalCost || 0;
        const hamperProduct = {
          id: product.id,
          name: product.name,
          category: product.category,
          quantity: productQuantity,
          unitPrice: unitPrice,
          totalPrice: unitPrice * productQuantity
        };
        
        console.log('Creating hamper product:', hamperProduct);
        
        setNewHamper(prev => ({
          ...prev,
          products: [...prev.products, hamperProduct]
        }));
        
        setSelectedProduct('');
        setProductQuantity(1);
      } else {
        console.error('Product not found for ID:', selectedProduct);
        setError('Selected product not found');
      }
    } else {
      console.error('Invalid selection:', selectedProduct, productQuantity);
      setError('Please select a product and valid quantity');
    }
  };

  const removeProductFromHamper = (index) => {
    setNewHamper(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const calculateHamperCost = (hamperProducts) => {
    const cost = hamperProducts.reduce((total, product) => total + product.totalPrice, 0);
    console.log('Hamper cost calculation:', hamperProducts.length, 'products, total cost:', cost);
    return cost;
  };

  // Save hamper (now uses API)
  const saveHamper = async (finalPrice, profitMargin) => {
    if (newHamper.occasionName && newHamper.products.length > 0) {
      const hamperData = {
        occasionName: newHamper.occasionName,
        category: newHamper.category,
        products: newHamper.products,
        totalCost: newHamper.products.reduce((sum, p) => sum + p.totalPrice, 0),
        finalPrice: parseFloat(finalPrice),
        profitMargin: parseFloat(profitMargin),
        description: newHamper.description,
      };

      try {
        await hampersAPI.create(hamperData);
        const updatedHampers = await hampersAPI.getAll();
        setHampers(updatedHampers);
        
        // Reset form
        setNewHamper({
          occasionName: '',
          category: 'Gold',
          products: [],
          finalPrice: '',
          description: ''
        });
        setSelectedProductCategory('');
        setSelectedProduct('');
        setProductQuantity(1);
      } catch (error) {
        console.error('Failed to save hamper:', error);
        setError('Failed to save hamper');
      }
    }
  };

  // Delete hamper (now uses API)
  const deleteHamper = async (id) => {
    try {
      await hampersAPI.delete(id);
      const updatedHampers = await hampersAPI.getAll();
      setHampers(updatedHampers);
    } catch (error) {
      console.error('Failed to delete hamper:', error);
      setError('Failed to delete hamper');
    }
  };

  const getHamperRecommendations = (totalCost) => {
    // Since individual products already have profit built in,
    // show discount-based pricing recommendations for quantity discounts
    const recommendations = [
      { 
        discount: 5, 
        label: 'Small Quantity (1-2 boxes)', 
        price: totalCost * (1 - 0.05),
        savings: totalCost * 0.05,
        color: 'green' 
      },
      { 
        discount: 10, 
        label: 'Medium Quantity (3-5 boxes)', 
        price: totalCost * (1 - 0.10),
        savings: totalCost * 0.10,
        color: 'blue' 
      },
      { 
        discount: 15, 
        label: 'Large Quantity (6-10 boxes)', 
        price: totalCost * (1 - 0.15),
        savings: totalCost * 0.15,
        color: 'purple' 
      },
      { 
        discount: 20, 
        label: 'Bulk Order (10+ boxes)', 
        price: totalCost * (1 - 0.20),
        savings: totalCost * 0.20,
        color: 'amber' 
      },
      { 
        discount: 25, 
        label: 'Corporate/Festival Order', 
        price: totalCost * (1 - 0.25),
        savings: totalCost * 0.25,
        color: 'red' 
      }
    ];
    
    return recommendations;
  };

  // CORRECTED CALCULATION FUNCTIONS - Proper profit calculation logic
  
  // Helper function to calculate all costs from ingredient cost
  const calculateCostComponents = (ingredientCost) => {
    const ingredient = parseFloat(ingredientCost) || 0;
    const labour = ingredient * 0.20;        // 20% of ingredient cost
    const manufacturing = ingredient * 0.20;  // 20% of ingredient cost  
    const marketing = ingredient * 0.20;      // 20% of ingredient cost
    const delivery = 80;                      // Fixed ₹80
    const packaging = 80;                     // Fixed ₹80
    const totalCost = ingredient + labour + manufacturing + marketing + delivery + packaging;
    
    return {
      ingredientCost: ingredient,
      labourCost: labour,
      manufacturingCost: manufacturing,
      marketingCost: marketing,
      deliveryCost: delivery,
      packagingCost: packaging,
      totalCost: totalCost
    };
  };

  // 1. INGREDIENT → PRICE SCENARIOS (Forward calculation) - CORRECTED LOGIC
  const calculatePricing = (inputs) => {
    if (!inputs.ingredientCost) return null;
    
    const costs = calculateCostComponents(inputs.ingredientCost);
    const targetSellingPrice = inputs.targetSellingPrice ? parseFloat(inputs.targetSellingPrice) : null;
    
    // If target selling price is provided, calculate profit margin
    if (targetSellingPrice) {
      const priceBeforeGST = targetSellingPrice / 1.18;
      const profit = priceBeforeGST - costs.totalCost;
      const profitMargin = costs.totalCost > 0 ? (profit / costs.totalCost) * 100 : 0;  // Profit % on cost price
      
      return {
        ...costs,
        targetSellingPrice: targetSellingPrice,
        priceBeforeGST: priceBeforeGST,
        profit: profit,
        profitMargin: profitMargin,
        gstAmount: targetSellingPrice - priceBeforeGST,
        finalSellingPrice: targetSellingPrice
      };
    }
    
    // Default scenarios with different profit margins ON COST PRICE
    const scenarios = [60, 70, 75, 80, 85].map(margin => {
      const profit = costs.totalCost * (margin / 100);  // Profit = margin% of cost price
      const priceBeforeGST = costs.totalCost + profit;  // Cost + Profit
      const gstAmount = priceBeforeGST * 0.18;          // 18% GST on price before GST
      const finalSellingPrice = priceBeforeGST + gstAmount;  // Final price
      
      return {
        margin: margin,
        finalSellingPrice: finalSellingPrice,
        priceBeforeGST: priceBeforeGST,
        profit: profit,
        gstAmount: gstAmount,
        totalCost: costs.totalCost
      };
    });
    
    return {
      ...costs,
      scenarios: scenarios,
      finalSellingPrice: scenarios[2]?.finalSellingPrice || 0, // 75% margin as default
      priceBeforeGST: scenarios[2]?.priceBeforeGST || 0,
      profit: scenarios[2]?.profit || 0,
      profitMargin: 75,
      gstAmount: scenarios[2]?.gstAmount || 0
    };
  };

  // 2. COST PRICE → SELLING PRICE - CORRECTED LOGIC
  const calculateCostToSelling = (inputs) => {
    if (!inputs.costPrice) return null;
    
    const totalCost = parseFloat(inputs.costPrice);
    const profitPercent = parseFloat(inputs.customProfitPercent) || 75;
    
    // CORRECT LOGIC: Profit calculated ON cost price
    const profit = totalCost * (profitPercent / 100);     // Profit = margin% of cost price
    const priceBeforeGST = totalCost + profit;            // Cost + Profit  
    const gstAmount = priceBeforeGST * 0.18;              // 18% GST on price before GST
    const finalSellingPrice = priceBeforeGST + gstAmount; // Final price
    
    // Reverse calculate ingredient cost from total cost
    const ingredientCost = Math.max(0, (totalCost - 160) / 1.6);
    const costs = calculateCostComponents(ingredientCost);
    
    return {
      ...costs,
      totalCost: totalCost,
      finalSellingPrice: finalSellingPrice,
      priceBeforeGST: priceBeforeGST,
      profit: profit,
      profitMargin: profitPercent,  // This is the input margin on cost price
      gstAmount: gstAmount
    };
  };

  // 3. COST + TARGET ANALYSIS - CORRECTED LOGIC
  const calculateCostTargetAnalysis = (inputs) => {
    if (!inputs.costPrice || !inputs.targetSellingPrice) return null;
    
    const totalCost = parseFloat(inputs.costPrice);
    const targetPrice = parseFloat(inputs.targetSellingPrice);
    const priceBeforeGST = targetPrice / 1.18;
    const profit = priceBeforeGST - totalCost;
    const actualMargin = totalCost > 0 ? (profit / totalCost) * 100 : 0;  // Profit % on cost price
    const gstAmount = targetPrice - priceBeforeGST;
    
    // Reverse calculate ingredient cost
    const ingredientCost = Math.max(0, (totalCost - 160) / 1.6);
    const costs = calculateCostComponents(ingredientCost);
    
    return {
      ...costs,
      totalCost: totalCost,
      targetSellingPrice: targetPrice,
      priceBeforeGST: priceBeforeGST,
      profit: profit,
      actualMargin: actualMargin,  // Profit % on cost price
      gstAmount: gstAmount,
      finalSellingPrice: targetPrice,
      feasible: actualMargin > 0
    };
  };

  // 4. TARGET PRICE → MAX COST (Reverse calculation) - CORRECTED LOGIC
  const calculateReversePricing = (inputs) => {
    if (!inputs.targetSellingPrice || !inputs.targetMargin) return null;
    
    const targetPrice = parseFloat(inputs.targetSellingPrice);
    const targetMargin = parseFloat(inputs.targetMargin);
    
    // Work backwards: Final price → Price before GST → Cost + Profit → Cost
    const priceBeforeGST = targetPrice / 1.18;
    const maxTotalCost = priceBeforeGST / (1 + targetMargin/100);  // Cost when profit = margin% of cost
    const profit = priceBeforeGST - maxTotalCost;
    const gstAmount = targetPrice - priceBeforeGST;
    
    // Calculate maximum ingredient cost
    const maxIngredientCost = Math.max(0, (maxTotalCost - 160) / 1.6);
    const costs = calculateCostComponents(maxIngredientCost);
    
    return {
      ...costs,
      maxIngredientCost: maxIngredientCost,
      maxTotalCost: maxTotalCost,
      targetSellingPrice: targetPrice,
      priceBeforeGST: priceBeforeGST,
      profit: profit,
      targetMargin: targetMargin,
      actualMargin: targetMargin,  // Should match target margin
      gstAmount: gstAmount,
      finalSellingPrice: targetPrice,
      feasible: maxIngredientCost > 0
    };
  };

  // Update calculator inputs
  const updateCalcInputs = (field, value) => {
    setCalcInputs(prev => ({ ...prev, [field]: value }));
  };

  // Save calculated product (now uses API) - Always save complete breakdown
  const saveProduct = async (calculations) => {
    if (!calcInputs.productName || !calcInputs.productName.trim()) {
      setError('Please enter a product name');
      return;
    }

    try {
      // Use the correct calculation data based on calculator mode
      let calculationData = {};
      
      if (calculatorMode === 'cost-to-price' && forwardCalc) {
        calculationData = {
          ingredientCost: forwardCalc.ingredientCost,
          labourCost: forwardCalc.labourCost,
          manufacturingCost: forwardCalc.manufacturingCost,
          marketingCost: forwardCalc.marketingCost,
          packagingCost: forwardCalc.packagingCost,
          deliveryCost: forwardCalc.deliveryCost,
          totalCost: forwardCalc.totalCost,
          finalSellingPrice: forwardCalc.finalSellingPrice,
          priceBeforeGST: forwardCalc.priceBeforeGST,
          gstAmount: forwardCalc.gstAmount,
          profit: forwardCalc.profit,
          actualMargin: forwardCalc.profitMargin || forwardCalc.actualMargin
        };
      } else if (calculatorMode === 'cost-to-selling' && costToSellingCalc) {
        calculationData = {
          ingredientCost: costToSellingCalc.ingredientCost,
          labourCost: costToSellingCalc.labourCost,
          manufacturingCost: costToSellingCalc.manufacturingCost,
          marketingCost: costToSellingCalc.marketingCost,
          packagingCost: costToSellingCalc.packagingCost,
          deliveryCost: costToSellingCalc.deliveryCost,
          totalCost: costToSellingCalc.totalCost,
          finalSellingPrice: costToSellingCalc.finalSellingPrice,
          priceBeforeGST: costToSellingCalc.priceBeforeGST,
          gstAmount: costToSellingCalc.gstAmount,
          profit: costToSellingCalc.profit,
          actualMargin: costToSellingCalc.profitMargin
        };
      } else if (calculatorMode === 'cost-target-analysis' && costTargetCalc) {
        calculationData = {
          ingredientCost: costTargetCalc.ingredientCost,
          labourCost: costTargetCalc.labourCost,
          manufacturingCost: costTargetCalc.manufacturingCost,
          marketingCost: costTargetCalc.marketingCost,
          packagingCost: costTargetCalc.packagingCost,
          deliveryCost: costTargetCalc.deliveryCost,
          totalCost: costTargetCalc.totalCost,
          finalSellingPrice: costTargetCalc.finalSellingPrice,
          priceBeforeGST: costTargetCalc.priceBeforeGST,
          gstAmount: costTargetCalc.gstAmount,
          profit: costTargetCalc.profit,
          actualMargin: costTargetCalc.actualMargin
        };
      } else if (calculatorMode === 'price-to-cost' && reverseCalc) {
        calculationData = {
          ingredientCost: reverseCalc.ingredientCost,
          labourCost: reverseCalc.labourCost,
          manufacturingCost: reverseCalc.manufacturingCost,
          marketingCost: reverseCalc.marketingCost,
          packagingCost: reverseCalc.packagingCost,
          deliveryCost: reverseCalc.deliveryCost,
          totalCost: reverseCalc.maxTotalCost,
          finalSellingPrice: reverseCalc.finalSellingPrice,
          priceBeforeGST: reverseCalc.priceBeforeGST,
          gstAmount: reverseCalc.gstAmount,
          profit: reverseCalc.profit,
          actualMargin: reverseCalc.actualMargin
        };
      }

      const product = {
        name: calcInputs.productName.trim(),
        category: calcInputs.category,
        quantity: calcInputs.quantity,
        calculatorMode: calculatorMode,
        costStructureSnapshot: { 
          labourPercent: 20,
          packagingAmount: 80,        // Updated from 100
          manufacturingPercent: 20,
          marketingPercent: 20,
          deliveryAmount: 80,         // Updated from 100
          gstPercent: 18
        },
        // Input values
        ingredientCost: calcInputs.ingredientCost ? parseFloat(calcInputs.ingredientCost) : null,
        costPrice: calcInputs.costPrice ? parseFloat(calcInputs.costPrice) : null,
        targetSellingPrice: calcInputs.targetSellingPrice ? parseFloat(calcInputs.targetSellingPrice) : null,
        targetMargin: calcInputs.targetMargin ? parseFloat(calcInputs.targetMargin) : null,
        customProfitPercent: calcInputs.customProfitPercent ? parseFloat(calcInputs.customProfitPercent) : null,
        // Complete calculation results
        ...calculationData
      };
      
      console.log('Saving product with complete breakdown:', product);
      await productsAPI.create(product);
      
      // Refresh products list
      const updatedProducts = await productsAPI.getAll();
      setProducts(updatedProducts);
      
      // Clear form
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
      
      // Clear any existing errors
      setError(null);
      
      console.log('Product saved successfully with complete breakdown');
    } catch (error) {
      console.error('Failed to save product:', error);
      setError(`Failed to save product: ${error.message || 'Unknown error'}`);
    }
  };

  // Update existing product with new calculations (now uses API)
  const updateProductFromEdit = async (id, newInputs) => {
    try {
      const newCalc = calculateCostToSelling(newInputs);
      const updatedProductData = {
        ...newInputs,
        ...newCalc,
        costStructureSnapshot: { ...costStructure },
        updatedAt: new Date().toLocaleDateString()
      };
      
      await productsAPI.update(id, updatedProductData);
      const updatedProducts = await productsAPI.getAll();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Failed to update product:', error);
      setError('Failed to update product');
    }
  };

  // Delete product (now uses API)
  const deleteProduct = async (id) => {
    try {
      await productsAPI.delete(id);
      const updatedProducts = await productsAPI.getAll();
      setProducts(updatedProducts);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('Failed to delete product');
    }
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

  // Get calculations for display - with null checks
  const forwardCalc = calcInputs ? calculatePricing(calcInputs) : null;
  const costToSellingCalc = calculatorMode === 'cost-to-selling' && calcInputs ? calculateCostToSelling(calcInputs) : null;
  const costTargetCalc = calculatorMode === 'cost-target-analysis' && calcInputs ? calculateCostTargetAnalysis(calcInputs) : null;
  const reverseCalc = calculatorMode === 'price-to-cost' && calcInputs ? calculateReversePricing(calcInputs) : null;
  const editPreview = editingProduct ? calculateEditPreview(editingProduct) : null;

  // Get filtered products for hamper creation
  const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category);
  };

  const hamperCost = calculateHamperCost(newHamper.products);
  const hamperRecommendations = hamperCost > 0 ? getHamperRecommendations(hamperCost) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">Nolita Cacao Calculator- TSL</div>
              <div className="ml-4 text-sm text-gray-600">Professional Cost & Pricing Calculator</div>
              <div className="ml-4 text-xs text-red-600">DEPLOY TEST v3.0 - {new Date().toLocaleTimeString()}</div>
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading data from server...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Only show when not loading */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-md">
              {[
                { id: 'calculator', label: 'Calculator' },
                { id: 'products', label: 'Product Repository' },
                { id: 'hampers', label: 'Hamper Curation' },
                { id: 'categories', label: 'Category Management' },
                { id: 'rate-card', label: 'Rate Card' },
                { id: 'analysis', label: 'Analysis' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-white shadow-md transform -translate-y-0.5'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
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
                              {product.category} - Qty: {product.quantity} - ₹{(product.unitPrice || 0).toFixed(0)} each
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-semibold text-green-600">₹{(product.totalPrice || 0).toFixed(0)}</span>
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
                          Total Product Cost: ₹{(hamperCost || 0).toFixed(0)}
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

                  {/* Save Button - Simplified condition */}
                  {newHamper.occasionName && newHamper.products.length > 0 && (
                    <button
                      onClick={() => {
                        const totalCost = calculateHamperCost(newHamper.products);
                        const finalPrice = newHamper.finalPrice || totalCost;
                        const profitMargin = newHamper.finalPrice ? 
                          ((parseFloat(newHamper.finalPrice) - totalCost) / parseFloat(newHamper.finalPrice)) * 100 : 0;
                        saveHamper(finalPrice, profitMargin);
                      }}
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
                          <div key={rec.discount} className={`bg-gradient-to-r p-4 rounded-lg border ${
                            rec.color === 'amber' ? 'from-amber-50 to-amber-100 border-amber-300' :
                            rec.color === 'green' ? 'from-green-50 to-green-100 border-green-300' :
                            rec.color === 'blue' ? 'from-blue-50 to-blue-100 border-blue-300' :
                            rec.color === 'purple' ? 'from-purple-50 to-purple-100 border-purple-300' :
                            'from-red-50 to-red-100 border-red-300'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-lg">
                                {rec.discount}% Discount - {rec.label}
                              </span>
                              <span className="text-xl font-bold">₹{(rec.price || 0).toFixed(0)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Original Price</div>
                                <div className="font-semibold">₹{(hamperCost || 0).toFixed(0)}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">You Save</div>
                                <div className="font-semibold text-green-600">₹{rec.savings.toFixed(0)}</div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient Cost (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={calcInputs.ingredientCost}
                          onChange={(e) => updateCalcInputs('ingredientCost', e.target.value)}
                          placeholder="Enter ingredient cost"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Selling Price (₹) - Optional</label>
                        <input
                          type="number"
                          value={calcInputs.targetSellingPrice}
                          onChange={(e) => updateCalcInputs('targetSellingPrice', e.target.value)}
                          placeholder="Enter target selling price (optional)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">If provided, will calculate profit margin for this target price</p>
                      </div>
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
                    {forwardCalc && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">Cost Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div>Ingredient Cost: ₹{(forwardCalc.ingredientCost || 0).toFixed(0)}</div>
                          <div>Labour (20%): ₹{(forwardCalc.labourCost || 0).toFixed(0)}</div>
                          <div>Manufacturing (20%): ₹{(forwardCalc.manufacturingCost || 0).toFixed(0)}</div>
                          <div>Marketing (20%): ₹{(forwardCalc.marketingCost || 0).toFixed(0)}</div>
                          <div>Packaging: ₹{(forwardCalc.packagingCost || 0).toFixed(0)}</div>
                          <div>Delivery: ₹{(forwardCalc.deliveryCost || 0).toFixed(0)}</div>
                        </div>
                        <div className="border-t mt-3 pt-3">
                          <div className="font-bold text-blue-600">Total Cost: ₹{(forwardCalc.totalCost || 0).toFixed(0)}</div>
                        </div>
                      </div>
                    )}

                    {/* Target Price Analysis (if provided) */}
                    {forwardCalc && forwardCalc.targetSellingPrice && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-3">Target Price Analysis</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-green-600">Target Selling Price</div>
                            <div className="font-bold text-lg">₹{(forwardCalc.targetSellingPrice || 0).toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-green-600">Price before GST</div>
                            <div className="font-semibold">₹{(forwardCalc.priceBeforeGST || 0).toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-green-600">Profit Amount</div>
                            <div className="font-semibold">₹{(forwardCalc.profit || 0).toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-green-600">Profit Margin (on cost)</div>
                            <div className="font-bold text-green-700 text-lg">{(forwardCalc.profitMargin || 0).toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Default Pricing Scenarios (if no target price) */}
                    {forwardCalc && !forwardCalc.targetSellingPrice && forwardCalc.scenarios && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Smart Pricing Recommendations</h4>
                        {forwardCalc.scenarios.map((scenario, index) => (
                          <div key={scenario.margin || index} className={`p-4 rounded-lg border ${
                            scenario.margin === 75 ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold">
                                {scenario.margin || 0}% Profit on Cost {scenario.margin === 75 ? '(Recommended)' : ''}
                              </span>
                              <span className="text-xl font-bold text-green-600">₹{(scenario.finalSellingPrice || 0).toFixed(0)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Price before GST</div>
                                <div className="font-semibold">₹{(scenario.priceBeforeGST || 0).toFixed(0)}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Profit</div>
                                <div className="font-semibold">₹{(scenario.profit || 0).toFixed(0)}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">GST (18%)</div>
                                <div className="font-semibold">₹{(scenario.gstAmount || 0).toFixed(0)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Additional cost breakdown section - with null checks */}
                    {costToSellingCalc && (
                      <div className="bg-gray-50 p-4 rounded-lg mt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Cost Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-gray-600">GST ({costStructure.gstPercent}%)</div>
                            <div className="font-semibold">₹{(costToSellingCalc.gstAmount || 0).toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Profit Amount</div>
                            <div className="font-semibold text-green-600">₹{(costToSellingCalc.profit || 0).toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : calculatorMode === 'cost-to-selling' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={calcInputs.costPrice}
                          onChange={(e) => updateCalcInputs('costPrice', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Desired Profit Margin (%)</label>
                        <input
                          type="number"
                          step="1"
                          value={calcInputs.customProfitPercent}
                          onChange={(e) => updateCalcInputs('customProfitPercent', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="75"
                        />
                      </div>
                    </div>

                    {costToSellingCalc && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-3">Complete Cost Breakdown</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>Ingredient Cost: ₹{(costToSellingCalc.ingredientCost || 0).toFixed(0)}</div>
                            <div>Labour (20%): ₹{(costToSellingCalc.labourCost || 0).toFixed(0)}</div>
                            <div>Manufacturing (20%): ₹{(costToSellingCalc.manufacturingCost || 0).toFixed(0)}</div>
                            <div>Marketing (20%): ₹{(costToSellingCalc.marketingCost || 0).toFixed(0)}</div>
                            <div>Packaging: ₹{(costToSellingCalc.packagingCost || 0).toFixed(0)}</div>
                            <div>Delivery: ₹{(costToSellingCalc.deliveryCost || 0).toFixed(0)}</div>
                          </div>
                          <div className="border-t mt-3 pt-3 grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-gray-600">Total Cost</div>
                              <div className="font-bold text-blue-600">₹{(costToSellingCalc.totalCost || 0).toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Profit</div>
                              <div className="font-bold text-green-600">₹{(costToSellingCalc.profit || 0).toFixed(0)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Final Selling Price</div>
                              <div className="font-bold text-amber-600 text-xl">₹{(costToSellingCalc.finalSellingPrice || 0).toFixed(0)}</div>
                            </div>
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

                {/* Save Product Button - Always show when product name exists */}
                {calcInputs.productName && calcInputs.productName.trim() && (
                  <button
                    onClick={() => {
                      const calculations = calculatorMode === 'cost-to-price' ? forwardCalc : 
                                         calculatorMode === 'cost-to-selling' ? costToSellingCalc :
                                         calculatorMode === 'cost-target-analysis' ? costTargetCalc :
                                         reverseCalc;
                      console.log('Saving product with calculations:', calculations);
                      saveProduct(calculations || {});
                    }}
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
        {/* Category Management Tab - Enhanced with Products and Hampers */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Category Management</h2>
            
            {/* Add New Category */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Category</h3>
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

            {/* Product Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Categories</h3>
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

            {/* Hamper Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Hamper Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Gold', 'Platinum', 'Luxe'].map((category) => (
                  <div key={category} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-gray-900">{category}</h4>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        category === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                        category === 'Platinum' ? 'bg-gray-100 text-gray-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {category}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Hampers: {hampers.filter(h => h.category === category).length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Repository Tab */}
        {activeTab === 'products' && (
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
                          
                          {/* Complete Component Breakdown - Always Show All Components */}
                          <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Quantity</div>
                                <div className="font-semibold">{boxCategories.includes(product.category) ? `Box of ${product.quantity}` : product.quantity}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Calculator Mode</div>
                                <div className="font-semibold text-blue-600">{product.calculatorMode?.replace('-', ' → ') || 'Standard'}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Ingredient Cost</div>
                                <div className="font-semibold">₹{(product.ingredientCost || 0).toFixed(0)}</div>
                              </div>
                              <div>
                                <div className="text-gray-600 font-bold">Final Selling Price</div>
                                <div className="font-bold text-green-600 text-lg">₹{(product.finalSellingPrice || 0).toFixed(0)}</div>
                              </div>
                            </div>

                            {/* Complete Cost Breakdown */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h5 className="font-semibold text-gray-800 mb-3">Complete Cost Breakdown</h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                                <div>
                                  <div className="text-gray-600">Labour ({product.costStructureSnapshot?.labourPercent || 20}%)</div>
                                  <div className="font-semibold">₹{(product.labourCost || 0).toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Packaging</div>
                                  <div className="font-semibold">₹{(product.packagingCost || product.costStructureSnapshot?.packagingAmount || 0).toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Manufacturing ({product.costStructureSnapshot?.manufacturingPercent || 20}%)</div>
                                  <div className="font-semibold">₹{(product.manufacturingCost || 0).toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Marketing ({product.costStructureSnapshot?.marketingPercent || 20}%)</div>
                                  <div className="font-semibold">₹{(product.marketingCost || 0).toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Delivery</div>
                                  <div className="font-semibold">₹{(product.deliveryCost || product.costStructureSnapshot?.deliveryAmount || 0).toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">GST ({product.costStructureSnapshot?.gstPercent || 18}%)</div>
                                  <div className="font-semibold">₹{(product.gstAmount || 0).toFixed(0)}</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                                <div>
                                  <div className="text-gray-600">Total Cost</div>
                                  <div className="font-bold text-blue-600">₹{(product.totalCost || 0).toFixed(0)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Profit Margin</div>
                                  <div className="font-bold text-amber-600">{(product.actualMargin || 0).toFixed(1)}%</div>
                                </div>
                              </div>
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

        {/* Rate Card Tab - Enhanced with Products and Hampers */}
        {activeTab === 'rate-card' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Official Rate Card</h2>
            
            {/* Products Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 bg-gray-50">
                      <th className="text-left py-4 px-6 font-bold text-lg">Category</th>
                      <th className="text-left py-4 px-6 font-bold text-lg">Product Name</th>
                      <th className="text-left py-4 px-6 font-bold text-lg">Quantity/Pack</th>
                      <th className="text-left py-4 px-6 font-bold text-lg">Selling Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const displayPrice = product.scenarios?.[2]?.finalSellingPrice || product.finalSellingPrice || product.targetFinalPrice;
                      const quantityDisplay = typeof product.quantity === 'number' ? 
                        `Box of ${product.quantity}` : 
                        product.quantity || 'Individual';
                      return (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-6 font-medium text-base">{product.category}</td>
                          <td className="py-4 px-6 text-base">{product.name}</td>
                          <td className="py-4 px-6 text-base text-blue-600">{quantityDisplay}</td>
                          <td className="py-4 px-6 font-bold text-lg text-green-600">₹{displayPrice?.toFixed(0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No products available. Create products first.
                  </div>
                )}
              </div>
            </div>

            {/* Hampers Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Hampers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 bg-gray-50">
                      <th className="text-left py-4 px-6 font-bold text-lg">Occasion</th>
                      <th className="text-left py-4 px-6 font-bold text-lg">Category</th>
                      <th className="text-left py-4 px-6 font-bold text-lg">Items Count</th>
                      <th className="text-left py-4 px-6 font-bold text-lg">Final Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hampers.map((hamper) => (
                      <tr key={hamper.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium text-base">{hamper.occasionName}</td>
                        <td className="py-4 px-6 text-base">{hamper.category}</td>
                        <td className="py-4 px-6 text-base text-blue-600">{hamper.products?.length || 0} items</td>
                        <td className="py-4 px-6 font-bold text-lg text-green-600">₹{hamper.finalPrice?.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {hampers.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No hampers available. Create hampers first.
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
      )}

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