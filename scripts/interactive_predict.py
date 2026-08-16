import pandas as pd
import joblib
import os
import sys

# Ensure UTF-8 output for emojis and ASCII bars in Windows terminal
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rev_model_path = os.path.join(BASE_DIR, 'models', 'revenue_model.joblib')
prod_model_path = os.path.join(BASE_DIR, 'models', 'productivity_model.joblib')

if not os.path.exists(rev_model_path) or not os.path.exists(prod_model_path):
    print("Error: Models not found. Please run train_models.py first.")
    exit()

print("Loading trained XGBoost models...\n")
revenue_package = joblib.load(rev_model_path)
productivity_package = joblib.load(prod_model_path)

revenue_preprocessor = revenue_package['preprocessor']
revenue_model = revenue_package['model']
productivity_preprocessor = productivity_package['preprocessor']
productivity_model = productivity_package['model']

def get_input(prompt, cast_type=str, default=None, valid_options=None):
    if default is not None:
        prompt_text = f"{prompt} [{default}]: "
    else:
        prompt_text = f"{prompt}: "
        
    while True:
        try:
            val = input(prompt_text)
            if not val and default is not None:
                val = default
            else:
                val = cast_type(val)
                
            if valid_options is not None:
                if type(val) == str:
                    matched = False
                    for opt in valid_options:
                        if val.lower() == opt.lower():
                            val = opt
                            matched = True
                            break
                    if not matched:
                        print(f"❌ Invalid choice! Must be one of:\n{', '.join(valid_options)}")
                        continue
                elif val not in valid_options:
                    print(f"❌ Invalid choice! Must be one of:\n{valid_options}")
                    continue
                    
            return val
        except ValueError:
            print(f"❌ Invalid input. Please enter a valid {cast_type.__name__}.")

def generate_bar(percentage):
    filled = int(percentage / 10)
    filled = max(0, min(10, filled))
    return "██" * filled + "░░" * (10 - filled)

print("==========================================")
print("      CEO SIMULATION - MANUAL ENTRY       ")
print("==========================================\n")

valid_industries = ["Technology", "Healthcare", "Finance", "Manufacturing", "Retail", "Education", "Energy", "Logistics", "Telecom", "Agriculture"]
valid_countries = ["United States", "Germany", "China", "India", "United Kingdom", "Japan", "Brazil", "South Korea"]

industry = get_input("Enter Industry", str, "Technology", valid_industries)
country = get_input("Enter Country", str, "United States", valid_countries)
year = get_input("Enter Year", int, 2026)
ai_adoption_level = get_input("Enter AI Adoption Level (0.0 to 5.0)", float, 3.5)
ai_investment_usd = get_input("Enter AI Investment (USD)", int, 5000000)
automation_rate = get_input("Enter Automation Rate (%)", float, 45.0)
employee_ai_training_hours = get_input("Enter Employee AI Training Hours", float, 120.0)
ai_maturity_score = get_input("Enter AI Maturity Score (0.0 to 100.0)", float, 75.0)
deployment_count = get_input("Enter Number of AI Deployments", int, 10)

sample_data = {
    'industry': [industry],
    'country': [country],
    'year': [year],
    'ai_adoption_level': [ai_adoption_level],
    'ai_investment_usd': [ai_investment_usd],
    'automation_rate': [automation_rate],
    'employee_ai_training_hours': [employee_ai_training_hours],
    'ai_maturity_score': [ai_maturity_score],
    'deployment_count': [deployment_count]
}

def engineer_features(df):
    df["investment_per_deployment"] = df["ai_investment_usd"] / (df["deployment_count"]+1)
    df["training_per_deployment"] = df["employee_ai_training_hours"] / (df["deployment_count"]+1)
    df["investment_maturity"] = df["ai_investment_usd"] * df["ai_maturity_score"]
    df["automation_maturity"] = df["automation_rate"] * df["ai_maturity_score"]
    df["training_adoption"] = df["employee_ai_training_hours"] * df["ai_adoption_level"]
    df["investment_training"] = df["ai_investment_usd"] * df["employee_ai_training_hours"]
    df["automation_investment"] = df["automation_rate"] * df["ai_investment_usd"]
    df["deployment_training"] = df["deployment_count"] * df["employee_ai_training_hours"]
    return df

def build_model_frame(data, investment_multiplier=1.0):
    df = pd.DataFrame(data)
    df["ai_investment_usd"] = df["ai_investment_usd"] * investment_multiplier
    df["ai_adoption_level"] = df["ai_adoption_level"] / 5.0
    df["automation_rate"] = df["automation_rate"] / 100.0
    df["ai_maturity_score"] = df["ai_maturity_score"] / 10.0
    return engineer_features(df)

def predict_scenario(investment_multiplier):
    df = build_model_frame(sample_data, investment_multiplier)
    
    X_rev = revenue_preprocessor.transform(df)
    rev_impact = float(revenue_model.predict(X_rev)[0])
    
    invest = sample_data['ai_investment_usd'][0] * investment_multiplier
    roi = ((rev_impact - invest) / invest) * 100 if invest > 0 else 0
    return rev_impact, roi

print("\nRunning AI Prediction Engine (XGBoost)...")

try:
    df_sample = pd.DataFrame(sample_data)
    df_sample = engineer_features(df_sample)
    
    X_sample_prod = productivity_preprocessor.transform(df_sample)
    predicted_productivity_gain = productivity_model.predict(X_sample_prod)[0]
    productivity_percentage = predicted_productivity_gain * 100
    
    # Run Scenarios
    rev_A, roi_A = predict_scenario(1.0)
    rev_B, roi_B = predict_scenario(1.2)
    rev_C, roi_C = predict_scenario(1.5)

    # --- AI TRANSFORMATION SCORE (New Weights) ---
    scaled_adoption = (ai_adoption_level / 5.0) * 100
    scaled_deployment = min(100.0, deployment_count * 2.0)
    scaled_training = min(100.0, employee_ai_training_hours / 2.0) # Assuming ~200 hours is 100%
    
    transform_score = (0.30 * ai_maturity_score) + (0.25 * automation_rate) + (0.20 * scaled_adoption) + (0.15 * scaled_training) + (0.10 * scaled_deployment)
    transform_score = min(100.0, max(0.0, transform_score))
    
    transform_status = "Strong AI Adoption" if transform_score > 71 else "Developing AI Capabilities" if transform_score > 41 else "Lagging AI Adoption"

    # --- READINESS & RISK (Tied to Transform Score) ---
    if transform_score >= 71:
        readiness_text = "HIGH"
        readiness_icon = "🟢"
        risk_percentage = max(5, 100 - transform_score)
    elif transform_score >= 41:
        readiness_text = "MEDIUM"
        readiness_icon = "🟡"
        risk_percentage = 100 - transform_score
    else:
        readiness_text = "LOW"
        readiness_icon = "🔴"
        risk_percentage = min(95, 120 - transform_score)

    # --- STRATEGIC RECOMMENDATION & BOARD DECISION ---
    if roi_C > roi_A and roi_B > roi_A:
        recommendation = "The organization demonstrates strong growth potential. Continue enterprise-wide deployment and invest heavily in advanced automation. Proceed with aggressive capital expansion as higher investment yields significantly greater ROI."
        board_decision = "🟢 APPROVE AGGRESSIVE EXPANSION"
        board_reason = "• High projected ROI scaling\n• Diminishing returns not yet reached\n• Strong productivity gains expected"
    elif roi_B > roi_A:
        recommendation = "Moderate growth detected. Proceed with cautious expansion (+20%). Pushing to +50% shows diminishing returns. Focus on workforce upskilling before massive capital expenditures."
        board_decision = "🟡 APPROVE CAUTIOUS EXPANSION"
        board_reason = "• ROI improves marginally at +20%\n• Severe drop-off at +50% investment\n• Requires targeted scaling"
    else:
        recommendation = "Maintain the current investment strategy. Focus on improving AI maturity, automation efficiency, and workforce training before scaling AI spending further. Additional capital investment currently shows diminishing returns."
        board_decision = "🔴 DELAY EXPANSION"
        board_reason = "• ROI decreases significantly under higher investments\n• Diminishing returns detected\n• Needs improved AI maturity before scaling"

    # --- RENDER CONSULTING REPORT ---
    print("\n═══════════════════════════════════")
    print("      EXECUTIVE STRATEGY REPORT    ")
    print("═══════════════════════════════════\n")

    print("🏢 Company Profile")
    print(f"Industry            : {industry}")
    print(f"Country             : {country}")
    print(f"AI Maturity         : {ai_maturity_score:.0f}/100\n")

    print("📊 Predicted Outcomes")
    print(f"Revenue Impact      : ${rev_A/1_000_000:.2f} Million")
    print(f"Productivity Gain   : {productivity_percentage:.1f}%")
    print(f"Estimated ROI       : {roi_A:.0f}%\n")

    print(f"{readiness_icon} Readiness Level")
    print(f"{readiness_text}\n")
    
    print("═══════════════════════════════════")
    print("📊 AI Transformation Score")
    print(f"{generate_bar(transform_score)} {transform_score:.0f}/100")
    print(f"Status:\n{transform_status}")
    print("═══════════════════════════════════\n")

    print("⚖️  Risk & Reliability Analysis")
    print(f"Risk Score          : {generate_bar(risk_percentage)} {risk_percentage:.0f}%")
    print(f"Rev. Reliability    : Moderate (R² = 0.596)")
    print(f"Prod. Reliability   : High (R² = 0.958)\n")

    print("💵 ROI Explanation")
    print(f"Investment          : ${(ai_investment_usd/1_000_000):.2f}M")
    print(f"Expected Revenue    : ${rev_A/1_000_000:.2f}M")
    print(f"Estimated Net Gain  : ${(rev_A - ai_investment_usd)/1_000_000:.2f}M")
    print(f"Estimated ROI       : {roi_A:.0f}%\n")

    print("🔮 Scenario Analysis")
    print("Scenario A (Maintain Budget)")
    print(f"Revenue : ${rev_A/1_000_000:.2f}M")
    print(f"ROI     : {roi_A:.0f}%\n")
    
    print("Scenario B (+20% Investment)")
    print(f"Revenue : ${rev_B/1_000_000:.2f}M")
    print(f"ROI     : {roi_B:.0f}%\n")
    
    print("Scenario C (+50% Investment)")
    print(f"Revenue : ${rev_C/1_000_000:.2f}M")
    print(f"ROI     : {roi_C:.0f}%\n")

    print("💡 Strategic Recommendation")
    import textwrap
    wrapped_rec = textwrap.fill(recommendation, width=35)
    print(wrapped_rec)

    print("\n═══════════════════════════════════\n")
    
    print("🏛  BOARD DECISION")
    print(f"{board_decision}\n")
    print("Reason:")
    print(board_reason)
    print("\n═══════════════════════════════════\n")

except Exception as e:
    print(f"\nError during prediction: {e}")
