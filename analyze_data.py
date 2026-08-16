import pandas as pd
import numpy as np

# Load the dataset
file_path = 'd:\\task2\\corporate_ai_adoption_dataset.csv'
df = pd.read_csv(file_path)

print("=== 2. Dataset Structure ===")
print(f"Rows: {df.shape[0]}")
print(f"Columns: {df.shape[1]}")
print("\nColumn Names:")
for col in df.columns:
    print(f"- {col}")

print("\nData Types:")
print(df.dtypes)

print("\n=== 4. Missing Values ===")
missing_count = df.isnull().sum()
missing_percent = (df.isnull().sum() / len(df)) * 100
missing_df = pd.DataFrame({'Null Count': missing_count, 'Missing %': missing_percent})
missing_df = missing_df[missing_df['Null Count'] > 0]

if missing_df.empty:
    print("No missing values found.")
else:
    print(missing_df.to_string())

print("\n=== 5. Duplicate Rows ===")
duplicates = df.duplicated().sum()
print(f"Duplicate Rows: {duplicates}")

print("\n=== 6. Data Types Analysis ===")
print("Checking for potential type conversions (e.g., numbers/dates stored as strings)...")
conversion_found = False
for col in df.select_dtypes(include=['object']).columns:
    # Try converting to numeric first
    try:
        pd.to_numeric(df[col])
        print(f"- Column '{col}' is currently string/object but could be converted to numeric.")
        conversion_found = True
        continue # if numeric, skip date check
    except ValueError:
        pass
    
    # Try converting to datetime
    try:
        pd.to_datetime(df[col], errors='raise')
        print(f"- Column '{col}' is currently string/object but could be converted to datetime.")
        conversion_found = True
    except (ValueError, TypeError):
        pass

if not conversion_found:
    print("No obvious string-to-numeric or string-to-datetime conversions detected.")


print("\n=== 9. Outlier Detection (using IQR method) ===")
numeric_cols = df.select_dtypes(include=[np.number]).columns
outliers_found = False
for col in numeric_cols:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
    if not outliers.empty:
        outliers_found = True
        print(f"- Column '{col}': {len(outliers)} outliers detected (values < {lower_bound:.2f} or > {upper_bound:.2f}).")

if not outliers_found and len(numeric_cols) > 0:
    print("No outliers detected in numeric columns using the IQR method.")
elif len(numeric_cols) == 0:
    print("No numeric columns available for outlier detection.")
