import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(os.path.join(BASE_DIR, 'models'), exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(os.path.join(BASE_DIR, 'corporate_ai_adoption_dataset.csv'))

print("Removing extreme outliers (1st to 99th percentile)...")
target_col = 'revenue_impact'
low = df[target_col].quantile(0.01)
high = df[target_col].quantile(0.99)
df = df[(df[target_col] >= low) & (df[target_col] <= high)]
print(f"Dataset size after outlier removal: {len(df)} rows")

print("Engineering new features...")
df["investment_per_deployment"] = df["ai_investment_usd"] / (df["deployment_count"]+1)
df["training_per_deployment"] = df["employee_ai_training_hours"] / (df["deployment_count"]+1)
df["investment_maturity"] = df["ai_investment_usd"] * df["ai_maturity_score"]
df["automation_maturity"] = df["automation_rate"] * df["ai_maturity_score"]
df["training_adoption"] = df["employee_ai_training_hours"] * df["ai_adoption_level"]

# Recommended interaction features
df["investment_training"] = df["ai_investment_usd"] * df["employee_ai_training_hours"]
df["automation_investment"] = df["automation_rate"] * df["ai_investment_usd"]
df["deployment_training"] = df["deployment_count"] * df["employee_ai_training_hours"]

features = [
    'industry', 'country', 'year', 'ai_adoption_level', 'ai_investment_usd', 
    'automation_rate', 'employee_ai_training_hours', 'ai_maturity_score', 'deployment_count',
    'investment_per_deployment', 'training_per_deployment', 'investment_maturity', 
    'automation_maturity', 'training_adoption', 
    'investment_training', 'automation_investment', 'deployment_training'
]

X = df[features]
y_revenue = df[target_col]

numeric_features = [
    'year', 'ai_adoption_level', 'ai_investment_usd', 'automation_rate', 
    'employee_ai_training_hours', 'ai_maturity_score', 'deployment_count',
    'investment_per_deployment', 'training_per_deployment', 'investment_maturity', 
    'automation_maturity', 'training_adoption', 
    'investment_training', 'automation_investment', 'deployment_training'
]
categorical_features = ['industry', 'country']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

print("Preprocessing data and splitting into train/test sets...")
X_train_rev, X_test_rev, y_train_rev, y_test_rev = train_test_split(X, y_revenue, test_size=0.2, random_state=42)

X_train_rev_transformed = preprocessor.fit_transform(X_train_rev)
X_test_rev_transformed = preprocessor.transform(X_test_rev)

print("Training Revenue Impact Model with Advanced XGBoost Parameters...")

xgb_revenue = xgb.XGBRegressor(
    n_estimators=1000,          # Increased trees, let early stopping decide when to stop
    learning_rate=0.01,         # Slower learning rate for finer adjustments
    max_depth=8,
    min_child_weight=3,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    reg_alpha=0.1,
    reg_lambda=1,
    early_stopping_rounds=50,   # Stops training if eval metrics don't improve
    random_state=42,
    n_jobs=-1
)

xgb_revenue.fit(
    X_train_rev_transformed, 
    y_train_rev,
    eval_set=[(X_test_rev_transformed, y_test_rev)],
    verbose=False
)

print("\n--- Model Evaluation ---")
y_pred_rev = xgb_revenue.predict(X_test_rev_transformed)

mae = mean_absolute_error(y_test_rev, y_pred_rev)
rmse = np.sqrt(mean_squared_error(y_test_rev, y_pred_rev))
r2 = r2_score(y_test_rev, y_pred_rev)

print(f"New Revenue Impact Model Metrics:")
print(f"  MAE:  {mae:,.2f}")
print(f"  RMSE: {rmse:,.2f}")
print(f"  R2:   {r2:.4f}")

old_r2 = 0.5957
if r2 > old_r2:
    print(f"\n[SUCCESS] Performance improved from R2 {old_r2:.4f} to {r2:.4f}!")
    print("Saving new model to 'models/revenue_model.joblib'...")
    revenue_package = {'preprocessor': preprocessor, 'model': xgb_revenue}
    joblib.dump(revenue_package, os.path.join(BASE_DIR, 'models', 'revenue_model.joblib'))
    print("New model saved successfully.")
else:
    print(f"\n[FAILED] Performance did not improve significantly (Current R2: {r2:.4f} vs Old R2: {old_r2:.4f}). Not overwriting model.")
