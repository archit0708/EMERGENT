        )}

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
                                <div className="font-semibold text-green-600">₹{(rec.savings || 0).toFixed(0)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {newHamper.finalPrice && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Your Pricing Analysis</h4>
                          <div className="text-sm space-y-1">
                            <div>Final Price: ₹{(parseFloat(newHamper.finalPrice) || 0).toFixed(0)}</div>
                            <div>Cost: ₹{(hamperCost || 0).toFixed(0)}</div>
                            <div>Profit: ₹{((parseFloat(newHamper.finalPrice) || 0) - (hamperCost || 0)).toFixed(0)}</div>
                            <div className="font-semibold">
                              Margin: {(((parseFloat(newHamper.finalPrice) || 0) - (hamperCost || 0)) / (parseFloat(newHamper.finalPrice) || 1) * 100).toFixed(1)}%
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
                                  <div>Cost: ₹{(hamper.totalCost || 0).toFixed(0)}</div>
                                  <div>Price: ₹{(hamper.finalPrice || 0).toFixed(0)}</div>
                                  <div>Margin: {(hamper.profitMargin || 0).toFixed(1)}%</div>
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
                          <td className="py-4 px-6 font-bold text-lg text-green-600">₹{(displayPrice || 0).toFixed(0)}</td>
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
                        <td className="py-4 px-6 font-bold text-lg text-green-600">₹{(hamper.finalPrice || 0).toFixed(0)}</td>
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
                      ₹{hampers.length > 0 ? (hampers.reduce((sum, h) => sum + (h.finalPrice || 0), 0) / hampers.length).toFixed(0) : '0'}
                    </div>
                    <div className="text-green-700">Avg Hamper Price</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {hampers.length > 0 ? (hampers.reduce((sum, h) => sum + (h.profitMargin || 0), 0) / hampers.length).toFixed(1) : '0'}%
                    </div>
                    <div className="text-blue-700">Avg Margin</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ₹{hampers.length > 0 ? (hampers.reduce((sum, h) => sum + (h.totalCost || 0), 0) / hampers.length).toFixed(0) : '0'}
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