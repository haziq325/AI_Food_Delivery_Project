import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

# 1. Generate Synthetic Data
# We will simulate 1000 past deliveries.
np.random.seed(42)
num_samples = 1000

# Distance in arbitrary units (similar to map coordinate distances, e.g. 1 to 20 units)
distances = np.random.uniform(1.0, 20.0, num_samples)

# Order sizes (1 to 10 items)
order_sizes = np.random.randint(1, 11, num_samples)

# Traffic conditions mapped to multipliers based on our delivery_brain values
# 0.8: light, 1.0: normal, 1.5: heavy, 2.5: jammed
traffic_multipliers = np.random.choice([0.8, 1.0, 1.5, 2.5], num_samples, p=[0.2, 0.5, 0.2, 0.1])

# Calculate "Actual" delivery time with some realistic noise
# Base assumption: 1 unit distance takes ~2 minutes. 
# Traffic slows it down multiplier. 
# Order size adds prep time (~2 mins per item).
# Plus random noise (e.g., rider getting slightly lost, traffic light delays)
noise = np.random.normal(0, 3, num_samples) # Mean 0, StdDev 3 mins
actual_times = (distances * 2 * traffic_multipliers) + (order_sizes * 2) + noise
actual_times = np.maximum(actual_times, 5) # Ensure no delivery takes less than 5 minutes

# Create DataFrame
df = pd.DataFrame({
    'distance': distances,
    'order_size': order_sizes,
    'traffic_multiplier': traffic_multipliers,
    'delivery_time_minutes': actual_times
})

# 2. Train the ML Model
X = df[['distance', 'order_size', 'traffic_multiplier']]
y = df['delivery_time_minutes']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

# 3. Evaluate the Model
predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
rmse = np.sqrt(mean_squared_error(y_test, predictions))

print(f"Model Training Complete!")
print(f"Mean Absolute Error (MAE): {mae:.2f} minutes")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f} minutes")
print(f"Model Coefficients:")
print(f"  - Distance Weight: {model.coef_[0]:.2f}")
print(f"  - Order Size Weight: {model.coef_[1]:.2f}")
print(f"  - Traffic Weight: {model.coef_[2]:.2f}")

# 4. Save the Model
# We export it using joblib so delivery_brain.py can use it for real-time predictions.
joblib.dump(model, 'eta_model.pkl')
print(f"Model successfully saved to 'eta_model.pkl'")
