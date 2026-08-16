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

print("Engineering new features...")
# Safe interaction features
df["investment_per_deployment"] = df["ai_investment_usd"] / (df["deployment_count"]+1)
df["training_per_deployment"] = df["employee_ai_training_hours"] / (df["deployment_count"]+1)
df["investment_maturity"] = df["ai_investment_usd"] * df["ai_maturity_score"]
df["automation_maturity"] = df["automation_rate"] * df["ai_maturity_score"]
df["training_adoption"] = df["employee_ai_training_hours"] * df["ai_adoption_level"]

# CRITICAL FIX: We must EXCLUDE 'cost_savings' and 'productivity_gain' from features
# because in the game, the CEO does not know their cost savings or productivity before 
# the year happens. Using them is Data Leakage.

features = [
    'industry', 'country', 'year', 'ai_adoption_level', 'ai_investment_usd', 
    'automation_rate', 'employee_ai_training_hours', 'ai_maturity_score', 'deployment_count',
    'investment_per_deployment', 'training_per_deployment', 'investment_maturity', 
    'automation_maturity', 'training_adoption'
]

target_revenue = 'revenue_impact'
target_productivity = 'productivity_gain'

X = df[features]
y_revenue = df[target_revenue]
y_productivity = df[target_productivity]

numeric_features = [
    'year', 'ai_adoption_level', 'ai_investment_usd', 'automation_rate', 
    'employee_ai_training_hours', 'ai_maturity_score', 'deployment_count',
    'investment_per_deployment', 'training_per_deployment', 'investment_maturity', 
    'automation_maturity', 'training_adoption'
]
categorical_features = ['industry', 'country']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

print("Preprocessing data and splitting into train/test sets...")
X_train_rev, X_test_rev, y_train_rev, y_test_rev = train_test_split(X, y_revenue, test_size=0.2, random_state=42)
X_train_prod, X_test_prod, y_train_prod, y_test_prod = train_test_split(X, y_productivity, test_size=0.2, random_state=42)

# Tuned hyperparameters to decrease MAE and RMSE
xgb_params = {
    'n_estimators': 300,
    'learning_rate': 0.05,
    'max_depth': 7,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'min_child_weight': 3,
    'random_state': 42,
    'n_jobs': -1
}

xgb_revenue = xgb.XGBRegressor(**xgb_params)
xgb_productivity = xgb.XGBRegressor(**xgb_params)

print("Training Revenue Impact Model...")
X_train_rev_transformed = preprocessor.fit_transform(X_train_rev)
X_test_rev_transformed = preprocessor.transform(X_test_rev)
xgb_revenue.fit(X_train_rev_transformed, y_train_rev)

print("Training Productivity Gain Model...")
X_train_prod_transformed = preprocessor.transform(X_train_prod)
X_test_prod_transformed = preprocessor.transform(X_test_prod)
xgb_productivity.fit(X_train_prod_transformed, y_train_prod)

print("\n--- Model Evaluation ---")
def evaluate_model(name, y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    print(f"\n{name} Metrics:")
    print(f"  MAE:  {mae:,.2f}")
    print(f"  RMSE: {rmse:,.2f}")
    print(f"  R2:   {r2:.4f}")

y_pred_rev = xgb_revenue.predict(X_test_rev_transformed)
y_pred_prod = xgb_productivity.predict(X_test_prod_transformed)

evaluate_model("Revenue Impact Model", y_test_rev, y_pred_rev)
evaluate_model("Productivity Gain Model", y_test_prod, y_pred_prod)

print("\nSaving models to 'models/' directory...")
revenue_package = {'preprocessor': preprocessor, 'model': xgb_revenue}
productivity_package = {'preprocessor': preprocessor, 'model': xgb_productivity}
joblib.dump(revenue_package, os.path.join(BASE_DIR, 'models', 'revenue_model.joblib'))
joblib.dump(productivity_package, os.path.join(BASE_DIR, 'models', 'productivity_model.joblib'))
print("Training complete! Models saved successfully.")
