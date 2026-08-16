import pandas as pd
# pyrefly: ignore [missing-import]
import joblib
import os
import sys

# Ensure UTF-8 output for emojis in Windows terminal
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rev_model_path = os.path.join(BASE_DIR, 'models', 'revenue_model.joblib')
prod_model_path = os.path.join(BASE_DIR, 'models', 'productivity_model.joblib')

if not os.path.exists(rev_model_path) or not os.path.exists(prod_model_path):
    print("Error: Models not found. Please run train_models.py first.")
    exit()

print("Loading trained XGBoost models...")
revenue_package = joblib.load(rev_model_path)
productivity_package = joblib.load(prod_model_path)

revenue_preprocessor = revenue_package['preprocessor']
revenue_model = revenue_package['model']
productivity_preprocessor = productivity_package['preprocessor']
productivity_model = productivity_package['model']

sample_data = {
    'industry': ['Technology'],
    'country': ['United States'],
    'year': [2026],
    'ai_adoption_level': [3.5],
    'ai_investment_usd': [5000000],
    'automation_rate': [45.0],
    'employee_ai_training_hours': [120],
    'ai_maturity_score': [75.0],
    'deployment_count': [10]
}

df_sample = pd.DataFrame(sample_data)
df_sample["ai_adoption_level"] = df_sample["ai_adoption_level"] / 5.0
df_sample["automation_rate"] = df_sample["automation_rate"] / 100.0
df_sample["ai_maturity_score"] = df_sample["ai_maturity_score"] / 10.0

df_sample["investment_per_deployment"] = df_sample["ai_investment_usd"] / (df_sample["deployment_count"]+1)
df_sample["training_per_deployment"] = df_sample["employee_ai_training_hours"] / (df_sample["deployment_count"]+1)
df_sample["investment_maturity"] = df_sample["ai_investment_usd"] * df_sample["ai_maturity_score"]
df_sample["automation_maturity"] = df_sample["automation_rate"] * df_sample["ai_maturity_score"]
df_sample["training_adoption"] = df_sample["employee_ai_training_hours"] * df_sample["ai_adoption_level"]
df_sample["investment_training"] = df_sample["ai_investment_usd"] * df_sample["employee_ai_training_hours"]
df_sample["automation_investment"] = df_sample["automation_rate"] * df_sample["ai_investment_usd"]
df_sample["deployment_training"] = df_sample["deployment_count"] * df_sample["employee_ai_training_hours"]

print("\n--- CEO's Strategic Input ---")
for key, value in sample_data.items():
    print(f"{key.replace('_', ' ').title()}: {value[0]}")

print("\nRunning AI Prediction Engine (XGBoost)...")
X_sample_rev = revenue_preprocessor.transform(df_sample)
X_sample_prod = productivity_preprocessor.transform(df_sample)

predicted_revenue_impact = revenue_model.predict(X_sample_rev)[0]
predicted_productivity_gain = revenue_model.predict(X_sample_prod)[0] if False else productivity_model.predict(X_sample_prod)[0]

# --- RICHER OUTPUT CALCULATIONS ---
# 1. Productivity is a fraction, so multiply by 100
productivity_percentage = predicted_productivity_gain * 100

# 2. ROI = ((Revenue Impact - Investment) / Investment) * 100
investment = sample_data['ai_investment_usd'][0]
estimated_roi = ((predicted_revenue_impact - investment) / investment) * 100

# 3. Format Revenue in Millions
revenue_millions = predicted_revenue_impact / 1_000_000

# 4. AI Readiness Logic
maturity = sample_data['ai_maturity_score'][0]
readiness = "High" if maturity > 60 else "Medium" if maturity > 30 else "Low"

print("\n==========================================")
print("      EXECUTIVE AI BOARDROOM REPORT       ")
print("==========================================")
print(f"💰 Estimated Revenue Impact:\n${revenue_millions:.2f} Million")
print(f"\n⚡ Productivity Improvement:\n{productivity_percentage:.1f}%")
print(f"\n📈 Estimated ROI:\n{estimated_roi:.0f}%")
print(f"\n🟢 AI Readiness:\n{readiness}")
print("\n🎯 Recommendation:\nIncrease AI deployment across additional business units.")
print("==========================================\n")
