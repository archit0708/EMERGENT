import React, { useState, useEffect, useMemo } from 'react';
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
  const [onlineMenuMode, setOnlineMenuMode] = useState('profit-margin'); // New state for online menu
  const [products, setProducts] = useState([]);
  const [onlineMenuProducts, setOnlineMenuProducts] = useState([]); // New state for online menu products
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

  // Online Menu inputs
  const [onlineMenuInputs, setOnlineMenuInputs] = useState({
    categoryName: '',
    productName: '',
    ingredientCost: '',
    desiredProfitMargin: 75,
    targetSellingPrice: ''
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

  // Update online menu inputs
  const updateOnlineMenuInputs = (field, value) => {
    setOnlineMenuInputs(prev => ({ ...prev, [field]: value }));
  };

  // ONLINE MENU CALCULATION FUNCTIONS - Zomato & Swiggy
  
  // Helper function for online menu cost calculation
  const calculateOnlineMenuCosts = (ingredientCost) => {
    const ingredient = parseFloat(ingredientCost) || 0;
    const labour = ingredient * 0.20;        // 20% of ingredient cost
    const manufacturing = ingredient * 0.20;  // 20% of ingredient cost  
    const marketing = ingredient * 0.20;      // 20% of ingredient cost
    const packaging = ingredient * 0.30;      // 30% of ingredient cost (increased for delivery)
    // No delivery cost for online platforms
    const totalCost = ingredient + labour + manufacturing + marketing + packaging;
    
    return {
      ingredientCost: ingredient,
      labourCost: labour,
      manufacturingCost: manufacturing,
      marketingCost: marketing,
      packagingCost: packaging,
      totalCost: totalCost
    };
  };

  // SCENARIO 1: Profit Margin → Online Selling Price
  const onlineMenuProfitCalc = useMemo(() => {
    if (!onlineMenuInputs.ingredientCost || !onlineMenuInputs.desiredProfitMargin) return null;
    
    const costs = calculateOnlineMenuCosts(onlineMenuInputs.ingredientCost);
    const profitMargin = parseFloat(onlineMenuInputs.desiredProfitMargin);
    
    // Calculate profit based on cost
    const profit = costs.totalCost * (profitMargin / 100);
    
    // Calculate selling price before platform commission
    const revenueNeeded = costs.totalCost + profit;
    
    // Calculate online selling price (accounting for 25% platform commission)
    // revenueNeeded = onlineSellingPrice × (1 - 0.25)
    // onlineSellingPrice = revenueNeeded ÷ 0.75
    const onlineSellingPrice = revenueNeeded / 0.75;
    const platformCommission = onlineSellingPrice * 0.25;
    const netRevenue = onlineSellingPrice - platformCommission;
    
    return {
      ...costs,
      profit: profit,
      profitMargin: profitMargin,
      netRevenue: netRevenue,
      platformCommission: platformCommission,
      onlineSellingPrice: onlineSellingPrice
    };
  }, [onlineMenuInputs.ingredientCost, onlineMenuInputs.desiredProfitMargin]);

  // SCENARIO 2: Target Selling Price → Profit Analysis
  const onlineMenuPriceAnalysis = useMemo(() => {
    if (!onlineMenuInputs.ingredientCost || !onlineMenuInputs.targetSellingPrice) return null;
    
    const costs = calculateOnlineMenuCosts(onlineMenuInputs.ingredientCost);
    const targetPrice = parseFloat(onlineMenuInputs.targetSellingPrice);
    
    // Calculate platform commission and net revenue
    const platformCommission = targetPrice * 0.25;
    const netRevenue = targetPrice - platformCommission;
    
    // Calculate profit and margin
    const profit = netRevenue - costs.totalCost;
    const profitMargin = targetPrice > 0 ? (profit / targetPrice) * 100 : 0;
    
    return {
      ...costs,
      targetSellingPrice: targetPrice,
      platformCommission: platformCommission,
      netRevenue: netRevenue,
      profit: profit,
      profitMargin: profitMargin,
      feasible: profit > 0
    };
  }, [onlineMenuInputs.ingredientCost, onlineMenuInputs.targetSellingPrice]);

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

  // Save online menu product (uses API)
  const saveOnlineMenuProduct = async () => {
    if (!onlineMenuInputs.productName || !onlineMenuInputs.productName.trim()) {
      setError('Please enter a product name');
      return;
    }

    try {
      setError(null);
      const calculations = onlineMenuMode === 'profit-margin' ? onlineMenuProfitCalc : onlineMenuPriceAnalysis;
      
      if (!calculations) {
        setError('Please complete all required fields');
        return;
      }

      const onlineMenuProduct = {
        name: onlineMenuInputs.productName,
        category: onlineMenuInputs.categoryName || 'Online Menu',
        quantity: 'Online Platform',
        calculatorMode: `online-menu-${onlineMenuMode}`,
        costStructureSnapshot: {
          type: 'online-menu',
          labourPercent: 20,
          manufacturingPercent: 20,
          marketingPercent: 20,
          packagingPercent: 30,
          platformCommission: 25
        },
        // Core calculation data
        ingredientCost: calculations.ingredientCost,
        labourCost: calculations.labourCost,
        manufacturingCost: calculations.manufacturingCost,
        marketingCost: calculations.marketingCost,
        packagingCost: calculations.packagingCost,
        totalCost: calculations.totalCost,
        finalSellingPrice: calculations.onlineSellingPrice || calculations.targetSellingPrice,
        platformCommission: calculations.platformCommission,
        netRevenue: calculations.netRevenue,
        profit: calculations.profit,
        actualMargin: calculations.profitMargin,
        // Online menu specific data
        onlineMenuMode: onlineMenuMode,
        desiredProfitMargin: onlineMenuInputs.desiredProfitMargin,
        targetSellingPrice: onlineMenuInputs.targetSellingPrice,
        feasible: calculations.feasible !== false
      };

      await productsAPI.create(onlineMenuProduct);
      
      // Update products list
      const updatedProducts = await productsAPI.getAll();
      setProducts(updatedProducts);
      
      // Update online menu products list
      const onlineMenuProducts = updatedProducts.filter(p => p.calculatorMode?.startsWith('online-menu'));
      setOnlineMenuProducts(onlineMenuProducts);
      
      // Clear form
      setOnlineMenuInputs({
        categoryName: '',
        productName: '',
        ingredientCost: '',
        desiredProfitMargin: 75,
        targetSellingPrice: ''
      });
      
      console.log('Online menu product saved successfully');
    } catch (error) {
      console.error('Failed to save online menu product:', error);
      setError(`Failed to save online menu product: ${error.message || 'Unknown error'}`);
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
                { id: 'online-menu', label: 'Online Menu Pricing' },
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

        {/* Online Menu Pricing Tab - NEW MODULE */}
        {activeTab === 'online-menu' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Online Menu Pricing (Zomato & Swiggy)</h2>
            
            {/* Mode Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Calculation Mode</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setOnlineMenuMode('profit-margin')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    onlineMenuMode === 'profit-margin'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Profit Margin → Online Price
                </button>
                <button
                  onClick={() => setOnlineMenuMode('price-analysis')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    onlineMenuMode === 'price-analysis'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Target Price → Profit Analysis
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={onlineMenuInputs.categoryName}
                    onChange={(e) => updateOnlineMenuInputs('categoryName', e.target.value)}
                    placeholder="e.g., Desserts, Main Course"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={onlineMenuInputs.productName}
                    onChange={(e) => updateOnlineMenuInputs('productName', e.target.value)}
                    placeholder="e.g., Chocolate Truffle Cake"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient Cost (₹)</label>
                  <input
                    type="number"
                    value={onlineMenuInputs.ingredientCost}
                    onChange={(e) => updateOnlineMenuInputs('ingredientCost', e.target.value)}
                    placeholder="Enter ingredient cost"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Scenario-specific inputs and results */}
            {onlineMenuMode === 'profit-margin' ? (
              <div className="space-y-6">
                {/* Profit Margin Input */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Scenario 1: Profit Margin → Online Price</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desired Profit Margin (%)</label>
                    <input
                      type="number"
                      value={onlineMenuInputs.desiredProfitMargin}
                      onChange={(e) => updateOnlineMenuInputs('desiredProfitMargin', e.target.value)}
                      placeholder="75"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Results for Profit Margin Mode */}
                {onlineMenuProfitCalc && (
                  <div className="space-y-6">
                    {/* Cost Breakdown */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Cost Breakdown (Online Menu)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>Ingredient Cost: ₹{(onlineMenuProfitCalc.ingredientCost || 0).toFixed(0)}</div>
                        <div>Labour (20%): ₹{(onlineMenuProfitCalc.labourCost || 0).toFixed(0)}</div>
                        <div>Manufacturing (20%): ₹{(onlineMenuProfitCalc.manufacturingCost || 0).toFixed(0)}</div>
                        <div>Marketing (20%): ₹{(onlineMenuProfitCalc.marketingCost || 0).toFixed(0)}</div>
                        <div>Packaging (30%): ₹{(onlineMenuProfitCalc.packagingCost || 0).toFixed(0)}</div>
                        <div className="font-bold text-blue-600">Total Cost: ₹{(onlineMenuProfitCalc.totalCost || 0).toFixed(0)}</div>
                      </div>
                    </div>

                    {/* Final Results */}
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-3">Online Platform Pricing</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-green-600">Profit Amount</div>
                          <div className="font-bold text-lg">₹{(onlineMenuProfitCalc.profit || 0).toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-green-600">Platform Commission (25%)</div>
                          <div className="font-semibold">₹{(onlineMenuProfitCalc.platformCommission || 0).toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-green-600">Net Revenue</div>
                          <div className="font-semibold">₹{(onlineMenuProfitCalc.netRevenue || 0).toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-green-600 font-bold">Online Selling Price</div>
                          <div className="font-bold text-green-700 text-xl">₹{(onlineMenuProfitCalc.onlineSellingPrice || 0).toFixed(0)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Target Price Input */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Scenario 2: Target Price → Profit Analysis</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Online Selling Price (₹)</label>
                    <input
                      type="number"
                      value={onlineMenuInputs.targetSellingPrice}
                      onChange={(e) => updateOnlineMenuInputs('targetSellingPrice', e.target.value)}
                      placeholder="Enter target online price"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Results for Price Analysis Mode */}
                {onlineMenuPriceAnalysis && (
                  <div className="space-y-6">
                    {/* Cost Breakdown */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Cost Breakdown (Online Menu)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>Ingredient Cost: ₹{(onlineMenuPriceAnalysis.ingredientCost || 0).toFixed(0)}</div>
                        <div>Labour (20%): ₹{(onlineMenuPriceAnalysis.labourCost || 0).toFixed(0)}</div>
                        <div>Manufacturing (20%): ₹{(onlineMenuPriceAnalysis.manufacturingCost || 0).toFixed(0)}</div>
                        <div>Marketing (20%): ₹{(onlineMenuPriceAnalysis.marketingCost || 0).toFixed(0)}</div>
                        <div>Packaging (30%): ₹{(onlineMenuPriceAnalysis.packagingCost || 0).toFixed(0)}</div>
                        <div className="font-bold text-blue-600">Total Cost: ₹{(onlineMenuPriceAnalysis.totalCost || 0).toFixed(0)}</div>
                      </div>
                    </div>

                    {/* Analysis Results */}
                    <div className={`p-6 rounded-lg border ${
                      onlineMenuPriceAnalysis.feasible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <h4 className={`font-semibold mb-3 ${
                        onlineMenuPriceAnalysis.feasible ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Profitability Analysis
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-gray-600">Target Price</div>
                          <div className="font-bold text-lg">₹{(onlineMenuPriceAnalysis.targetSellingPrice || 0).toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Platform Commission (25%)</div>
                          <div className="font-semibold">₹{(onlineMenuPriceAnalysis.platformCommission || 0).toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Net Revenue</div>
                          <div className="font-semibold">₹{(onlineMenuPriceAnalysis.netRevenue || 0).toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Profit Margin</div>
                          <div className={`font-bold text-lg ${
                            onlineMenuPriceAnalysis.feasible ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {(onlineMenuPriceAnalysis.profitMargin || 0).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-sm">
                        <div className={onlineMenuPriceAnalysis.feasible ? 'text-green-700' : 'text-red-700'}>
                          {onlineMenuPriceAnalysis.feasible ? '✅ Profitable pricing' : '❌ Loss-making pricing - increase target price'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Save Product Button */}
            {onlineMenuInputs.productName && onlineMenuInputs.productName.trim() && (
              <button
                onClick={() => {
                  console.log('Save online menu product:', {
                    mode: onlineMenuMode,
                    inputs: onlineMenuInputs,
                    calculations: onlineMenuMode === 'profit-margin' ? onlineMenuProfitCalc : onlineMenuPriceAnalysis
                  });
                  // TODO: Implement save functionality
                }}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-6"
              >
                Save Online Menu Product
              </button>
            )}
          </div>
        )}

