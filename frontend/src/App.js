import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', cost: '', unit: 'grams' });
  const [newRecipe, setNewRecipe] = useState({ name: '', ingredients: [], sellingPrice: '', popularity: 5 });
  const [recipeIngredient, setRecipeIngredient] = useState({ ingredientId: '', quantity: '' });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedIngredients = localStorage.getItem('menuPricing_ingredients');
    const savedRecipes = localStorage.getItem('menuPricing_recipes');
    
    if (savedIngredients) {
      setIngredients(JSON.parse(savedIngredients));
    }
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('menuPricing_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('menuPricing_recipes', JSON.stringify(recipes));
  }, [recipes]);

  // Add new ingredient
  const addIngredient = () => {
    if (newIngredient.name && newIngredient.cost) {
      const ingredient = {
        id: Date.now(),
        name: newIngredient.name,
        cost: parseFloat(newIngredient.cost),
        unit: newIngredient.unit
      };
      setIngredients([...ingredients, ingredient]);
      setNewIngredient({ name: '', cost: '', unit: 'grams' });
    }
  };

  // Delete ingredient
  const deleteIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
    // Also remove from any recipes
    setRecipes(recipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients.filter(ing => ing.ingredientId !== id)
    })));
  };

  // Add ingredient to current recipe
  const addIngredientToRecipe = () => {
    if (recipeIngredient.ingredientId && recipeIngredient.quantity) {
      const ingredient = ingredients.find(ing => ing.id === parseInt(recipeIngredient.ingredientId));
      const recipeIng = {
        ingredientId: parseInt(recipeIngredient.ingredientId),
        name: ingredient.name,
        quantity: parseFloat(recipeIngredient.quantity),
        unit: ingredient.unit,
        cost: ingredient.cost
      };
      
      setNewRecipe({
        ...newRecipe,
        ingredients: [...newRecipe.ingredients, recipeIng]
      });
      setRecipeIngredient({ ingredientId: '', quantity: '' });
    }
  };

  // Remove ingredient from recipe
  const removeIngredientFromRecipe = (index) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter((_, i) => i !== index)
    });
  };

  // Calculate recipe cost
  const calculateRecipeCost = (recipeIngredients) => {
    return recipeIngredients.reduce((total, ing) => {
      return total + (ing.cost * ing.quantity);
    }, 0);
  };

  // Add new recipe
  const addRecipe = () => {
    if (newRecipe.name && newRecipe.ingredients.length > 0 && newRecipe.sellingPrice) {
      const recipe = {
        id: Date.now(),
        name: newRecipe.name,
        ingredients: newRecipe.ingredients,
        sellingPrice: parseFloat(newRecipe.sellingPrice),
        popularity: parseInt(newRecipe.popularity),
        foodCost: calculateRecipeCost(newRecipe.ingredients)
      };
      setRecipes([...recipes, recipe]);
      setNewRecipe({ name: '', ingredients: [], sellingPrice: '', popularity: 5 });
    }
  };

  // Delete recipe
  const deleteRecipe = (id) => {
    setRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  // Calculate profit margin
  const calculateProfitMargin = (sellingPrice, foodCost) => {
    return ((sellingPrice - foodCost) / sellingPrice * 100);
  };

  // Get recommended price based on target margin
  const getRecommendedPrice = (foodCost, targetMargin = 70) => {
    return foodCost / (1 - targetMargin / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">☕ MenuPricer</div>
              <div className="ml-4 text-sm text-gray-600">Cafe & Chocolate Studio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'ingredients'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            🥄 Ingredients
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'recipes'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            📋 Menu Items
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'analysis'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            }`}
          >
            📊 Analysis
          </button>
        </div>

        {/* Ingredients Tab */}
        {activeTab === 'ingredients' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Ingredient Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Ingredient</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient Name</label>
                  <input
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g., Premium Dark Chocolate"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost per Unit ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newIngredient.cost}
                      onChange={(e) => setNewIngredient({ ...newIngredient, cost: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="0.50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                    <select
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="grams">Grams</option>
                      <option value="ml">Milliliters</option>
                      <option value="cups">Cups</option>
                      <option value="pieces">Pieces</option>
                      <option value="tablespoons">Tablespoons</option>
                      <option value="teaspoons">Teaspoons</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={addIngredient}
                  className="w-full bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                >
                  Add Ingredient
                </button>
              </div>
            </div>

            {/* Ingredients List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Ingredients</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">{ingredient.name}</div>
                      <div className="text-sm text-gray-600">
                        ${ingredient.cost.toFixed(2)} per {ingredient.unit}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteIngredient(ingredient.id)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {ingredients.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No ingredients added yet. Add your first ingredient to get started!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Recipe Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Menu Item</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g., Dark Chocolate Truffle"
                  />
                </div>

                {/* Add Ingredients to Recipe */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Add Ingredients</h3>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <select
                      value={recipeIngredient.ingredientId}
                      onChange={(e) => setRecipeIngredient({ ...recipeIngredient, ingredientId: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Select Ingredient</option>
                      {ingredients.map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={recipeIngredient.quantity}
                      onChange={(e) => setRecipeIngredient({ ...recipeIngredient, quantity: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Quantity"
                    />
                  </div>
                  <button
                    onClick={addIngredientToRecipe}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mb-4"
                  >
                    Add to Recipe
                  </button>

                  {/* Recipe Ingredients List */}
                  <div className="space-y-2 mb-4">
                    {newRecipe.ingredients.map((ing, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                        <span className="text-sm">
                          {ing.name}: {ing.quantity} {ing.unit} (${(ing.cost * ing.quantity).toFixed(2)})
                        </span>
                        <button
                          onClick={() => removeIngredientFromRecipe(index)}
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  {newRecipe.ingredients.length > 0 && (
                    <div className="bg-amber-100 p-3 rounded-lg mb-4">
                      <div className="font-semibold">Total Food Cost: ${calculateRecipeCost(newRecipe.ingredients).toFixed(2)}</div>
                      <div className="text-sm text-gray-600">
                        Recommended Price (70% margin): ${getRecommendedPrice(calculateRecipeCost(newRecipe.ingredients)).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newRecipe.sellingPrice}
                      onChange={(e) => setNewRecipe({ ...newRecipe, sellingPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="8.50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Popularity (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newRecipe.popularity}
                      onChange={(e) => setNewRecipe({ ...newRecipe, popularity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={addRecipe}
                  className="w-full bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                >
                  Create Menu Item
                </button>
              </div>
            </div>

            {/* Recipes List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Menu Items</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                      <button
                        onClick={() => deleteRecipe(recipe.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Food Cost: ${recipe.foodCost.toFixed(2)}</div>
                      <div>Selling Price: ${recipe.sellingPrice.toFixed(2)}</div>
                      <div>Profit Margin: {calculateProfitMargin(recipe.sellingPrice, recipe.foodCost).toFixed(1)}%</div>
                      <div>Popularity: {recipe.popularity}/10</div>
                    </div>
                  </div>
                ))}
                {recipes.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No menu items created yet. Create your first item to get started!
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
                <div className="text-3xl font-bold text-amber-600">{recipes.length}</div>
                <div className="text-gray-600">Menu Items</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-green-600">
                  {recipes.length > 0 
                    ? (recipes.reduce((sum, recipe) => sum + calculateProfitMargin(recipe.sellingPrice, recipe.foodCost), 0) / recipes.length).toFixed(1)
                    : 0}%
                </div>
                <div className="text-gray-600">Avg Profit Margin</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-blue-600">
                  ${recipes.length > 0 
                    ? (recipes.reduce((sum, recipe) => sum + recipe.foodCost, 0) / recipes.length).toFixed(2)
                    : '0.00'}
                </div>
                <div className="text-gray-600">Avg Food Cost</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-purple-600">
                  {recipes.length > 0 
                    ? (recipes.reduce((sum, recipe) => sum + recipe.popularity, 0) / recipes.length).toFixed(1)
                    : 0}/10
                </div>
                <div className="text-gray-600">Avg Popularity</div>
              </div>
            </div>

            {/* Menu Engineering Matrix */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu Engineering Analysis</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* High Profit, High Popularity - Stars */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">⭐ Stars (High Profit + High Popularity)</h3>
                  <div className="space-y-2">
                    {recipes
                      .filter(recipe => 
                        calculateProfitMargin(recipe.sellingPrice, recipe.foodCost) >= 60 && 
                        recipe.popularity >= 7
                      )
                      .map(recipe => (
                        <div key={recipe.id} className="p-3 bg-white rounded shadow-sm">
                          <div className="font-medium">{recipe.name}</div>
                          <div className="text-sm text-gray-600">
                            {calculateProfitMargin(recipe.sellingPrice, recipe.foodCost).toFixed(1)}% margin, 
                            {recipe.popularity}/10 popularity
                          </div>
                        </div>
                      ))}
                    {recipes.filter(recipe => 
                      calculateProfitMargin(recipe.sellingPrice, recipe.foodCost) >= 60 && 
                      recipe.popularity >= 7
                    ).length === 0 && (
                      <div className="text-gray-500">No star items yet</div>
                    )}
                  </div>
                </div>

                {/* High Profit, Low Popularity - Puzzles */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">🧩 Puzzles (High Profit + Low Popularity)</h3>
                  <div className="space-y-2">
                    {recipes
                      .filter(recipe => 
                        calculateProfitMargin(recipe.sellingPrice, recipe.foodCost) >= 60 && 
                        recipe.popularity < 7
                      )
                      .map(recipe => (
                        <div key={recipe.id} className="p-3 bg-white rounded shadow-sm">
                          <div className="font-medium">{recipe.name}</div>
                          <div className="text-sm text-gray-600">
                            {calculateProfitMargin(recipe.sellingPrice, recipe.foodCost).toFixed(1)}% margin, 
                            {recipe.popularity}/10 popularity
                          </div>
                        </div>
                      ))}
                    {recipes.filter(recipe => 
                      calculateProfitMargin(recipe.sellingPrice, recipe.foodCost) >= 60 && 
                      recipe.popularity < 7
                    ).length === 0 && (
                      <div className="text-gray-500">No puzzle items</div>
                    )}
                  </div>
                </div>

                {/* Low Profit, High Popularity - Workhorses */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">🐎 Workhorses (Low Profit + High Popularity)</h3>
                  <div className="space-y-2">
                    {recipes
                      .filter(recipe => 
                        calculateProfitMargin(recipe.sellingPrice, recipe.foodCost) < 60 && 
                        recipe.popularity >= 7
                      )
                      .map(recipe => (
                        <div key={recipe.id} className="p-3 bg-white rounded shadow-sm">
                          <div className="font-medium">{recipe.name}</div>
                          <div className="text-sm text-gray-600">
                            {calculateProfitMargin(recipe.sellingPrice, recipe.foodCost).toFixed(1)}% margin, 
                            {recipe.popularity}/10 popularity
                          </div>
                        </div>
                      ))}
                    {recipes.filter(recipe => 
                      calculateProfitMargin(recipe.sellingPrice, recipe.foodCost) < 60 && 
                      recipe.popularity >= 7
                    ).length === 0 && (
                      <div className="text-gray-500">No workhorse items</div>
                    )}
                  </div>
                </div>

                {/* Low Profit, Low Popularity - Dogs */}
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">🐕 Dogs (Low Profit + Low Popularity)</h3>
                  <div className="space-y-2">
                    {recipes
                      .filter(recipe => 
                        calculateProfitMargin(recipe.sellingPrice, recipe.foodCost) < 60 && 
                        recipe.popularity < 7
                      )
                      .map(recipe => (
                        <div key={recipe.id} className="p-3 bg-white rounded shadow-sm">
                          <div className="font-medium">{recipe.name}</div>
                          <div className="text-sm text-gray-600">
                            {calculateProfitMargin(recipe.sellingPrice, recipe.foodCost).toFixed(1)}% margin, 
                            {recipe.popularity}/10 popularity
                          </div>
                        </div>
                      ))}
                    {recipes.filter(recipe => 
                      calculateProfitMargin(recipe.sellingPrice, recipe.foodCost) < 60 && 
                      recipe.popularity < 7
                    ).length === 0 && (
                      <div className="text-gray-500">No dog items</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Item Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Item Analysis</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Item Name</th>
                      <th className="text-left py-3 px-4">Food Cost</th>
                      <th className="text-left py-3 px-4">Selling Price</th>
                      <th className="text-left py-3 px-4">Profit Margin</th>
                      <th className="text-left py-3 px-4">Popularity</th>
                      <th className="text-left py-3 px-4">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((recipe) => {
                      const margin = calculateProfitMargin(recipe.sellingPrice, recipe.foodCost);
                      const isHighProfit = margin >= 60;
                      const isHighPopularity = recipe.popularity >= 7;
                      
                      let category = '';
                      let categoryColor = '';
                      
                      if (isHighProfit && isHighPopularity) {
                        category = 'Star';
                        categoryColor = 'text-green-600 bg-green-100';
                      } else if (isHighProfit && !isHighPopularity) {
                        category = 'Puzzle';
                        categoryColor = 'text-yellow-600 bg-yellow-100';
                      } else if (!isHighProfit && isHighPopularity) {
                        category = 'Workhorse';
                        categoryColor = 'text-blue-600 bg-blue-100';
                      } else {
                        category = 'Dog';
                        categoryColor = 'text-red-600 bg-red-100';
                      }
                      
                      return (
                        <tr key={recipe.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{recipe.name}</td>
                          <td className="py-3 px-4">${recipe.foodCost.toFixed(2)}</td>
                          <td className="py-3 px-4">${recipe.sellingPrice.toFixed(2)}</td>
                          <td className="py-3 px-4">{margin.toFixed(1)}%</td>
                          <td className="py-3 px-4">{recipe.popularity}/10</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-sm ${categoryColor}`}>
                              {category}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {recipes.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No menu items to analyze yet. Create some items first!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;