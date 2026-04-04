import pandas as pd
from sklearn.preprocessing import RobustScaler
import joblib
import numpy as np
from scipy.interpolate import interp1d

# This script is a subset of the data preparation and training logic from
# battery_analytics_system.ipynb. It is intended to regenerate the RUL_scaler.pkl
# file with the correct version of scikit-learn.

def clean_battery_data(df):
    df = df.drop_duplicates()
    df = df.dropna()
    numerical_cols = ['Time', 'Current', 'Voltage', 'Temperature']
    for col in numerical_cols:
        if col in df.columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
    if 'Voltage' in df.columns:
        df = df[df['Voltage'] > 0]
    if 'Temperature' in df.columns:
        df = df[(df['Temperature'] >= -40) & (df['Temperature'] <= 80)]
    if 'Time' in df.columns:
        df = df.sort_values('Time').reset_index(drop=True)
    return df

def create_advanced_features(df):
    df = df.copy()
    df['Power'] = df['Voltage'] * df['Current']
    df['Energy_cumulative'] = np.cumsum(df['Power'] * np.gradient(df['Time']))
    df['Internal_Resistance'] = np.where(df['Current'] != 0, df['Voltage'] / df['Current'], 0)
    df['Resistance_rolling'] = df['Internal_Resistance'].rolling(window=10, min_periods=1).mean()
    df['Voltage_derivative'] = np.gradient(df['Voltage'], df['Time'])
    df['Voltage_derivative_2nd'] = np.gradient(df['Voltage_derivative'], df['Time'])
    df['Current_abs'] = np.abs(df['Current'])
    df['Current_sign'] = np.sign(df['Current'])
    df['Current_derivative'] = np.gradient(df['Current'], df['Time'])
    df['Temp_derivative'] = np.gradient(df['Temperature'], df['Time'])
    df['Temp_normalized'] = (df['Temperature'] - 25) / 25
    window = 20
    for col in ['Voltage', 'Current', 'Temperature', 'Power']:
        if col in df.columns:
            df[f'{col}_rolling_mean'] = df[col].rolling(window=window, min_periods=1).mean()
            df[f'{col}_rolling_std'] = df[col].rolling(window=window, min_periods=1).std()
            df[f'{col}_rolling_min'] = df[col].rolling(window=window, min_periods=1).min()
            df[f'{col}_rolling_max'] = df[col].rolling(window=window, min_periods=1).max()
    df['Cycle_phase'] = 'rest'
    df.loc[df['Current'] > 0.1, 'Cycle_phase'] = 'charge'
    df.loc[df['Current'] < -0.1, 'Cycle_phase'] = 'discharge'
    df['Time_normalized'] = df['Time'] / df['Time'].max()
    df['Time_since_start'] = df['Time'] - df['Time'].min()
    df['Cell_age_indicator'] = df['cell_type'].map({'fresh': 0, 'aged': 1})
    voltage_min, voltage_max = 2.5, 4.2
    df['Voltage_normalized'] = (df['Voltage'] - voltage_min) / (voltage_max - voltage_min)
    df['Voltage_range_position'] = df['Voltage_normalized'].clip(0, 1)
    df['Estimated_capacity_indicator'] = np.interp(df['Voltage'], [2.5, 3.0, 3.7, 4.0, 4.2], [0, 0.1, 0.5, 0.8, 1.0])
    df['Overvoltage_risk'] = (df['Voltage'] > 4.1).astype(int)
    df['Undervoltage_risk'] = (df['Voltage'] < 3.0).astype(int)
    df['Overtemp_risk'] = (df['Temperature'] > 45).astype(int)
    df['Overcurrent_risk'] = (np.abs(df['Current']) > 20).astype(int)
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.ffill().bfill().fillna(0)
    return df

def generate_intelligent_targets(df, ocv_df):
    df = df.copy()
    if 'V0' in ocv_df.columns and 'SOC' in ocv_df.columns:
        ocv_interp = interp1d(ocv_df['V0'], ocv_df['SOC'], bounds_error=False, fill_value='extrapolate')
        soc_from_voltage = ocv_interp(df['Voltage'])
        coulomb_correction = np.cumsum(df['Current'] * np.gradient(df['Time'])) / 3600
        nominal_capacity = 20
        soc_correction = coulomb_correction / nominal_capacity
        df['SOC'] = np.clip(soc_from_voltage - soc_correction * 0.1, 0, 1) * 100
    else:
        voltage_min, voltage_max = 3.0, 4.2
        df['SOC'] = np.clip((df['Voltage'] - voltage_min) / (voltage_max - voltage_min), 0, 1) * 100
    soc_noise = np.random.normal(0, 1, len(df))
    df['SOC'] = df['SOC'] + soc_noise
    df['SOC'] = df['SOC'].rolling(window=5, min_periods=1).mean()
    df['SOC'] = np.clip(df['SOC'], 0, 100)
    base_soh = 100 if df['cell_type'].iloc[0] == 'fresh' else 85
    time_degradation = (df['Time_normalized'] * 15)
    temp_stress = np.maximum(0, (df['Temperature'] - 25) / 10) * 2
    voltage_stress = np.maximum(0, (df['Voltage'] - 4.0) / 0.2) * 3
    current_stress = (df['Current_abs'] / 20) * 1
    age_factor = df['Cell_age_indicator'] * 15
    total_degradation = time_degradation + temp_stress + voltage_stress + current_stress + age_factor
    df['SOH'] = np.clip(base_soh - total_degradation, 50, 100)
    soh_noise = np.random.normal(0, 0.5, len(df))
    df['SOH'] = df['SOH'] + soh_noise
    df['SOH'] = df['SOH'].rolling(window=10, min_periods=1).mean()
    df['SOH'] = np.clip(df['SOH'], 50, 100)
    max_cycles = 2000
    soh_factor = df['SOH'] / 100
    usage_intensity = (df['Current_abs'] / 20 + df['Temperature'] / 40 + (1 - df['Voltage_normalized'])) / 3
    base_rul_cycles = max_cycles * soh_factor * (1 - usage_intensity * 0.3)
    df['RUL'] = np.clip(base_rul_cycles, 100, max_cycles)
    degradation_rate = (100 - df['SOH']) / 100 * 200
    df['RUL'] = df['RUL'] - degradation_rate
    rul_noise = np.random.normal(0, 20, len(df))
    df['RUL'] = df['RUL'] + rul_noise
    df['RUL'] = df['RUL'].rolling(window=15, min_periods=1).mean()
    df['RUL'] = np.clip(df['RUL'], 50, max_cycles)
    return df

# Load data
data_dir = "/workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend/data/battery_data_set/"
df_fresh = pd.read_csv(data_dir + "Experimental_data_fresh_cell.csv")
df_aged = pd.read_csv(data_dir + "Experimental_data_aged_cell.csv")
df_ocv = pd.read_csv(data_dir + "OCV_vs_SOC_curve.csv")
df_fresh['cell_type'] = 'fresh'
df_aged['cell_type'] = 'aged'
df_combined = pd.concat([df_fresh, df_aged], ignore_index=True)

# Process data
df_clean = clean_battery_data(df_combined.copy())
df_featured = create_advanced_features(df_clean)
df_final = generate_intelligent_targets(df_featured, df_ocv)

# Define features and target
feature_cols = [col for col in df_final.columns if col not in ['SOC', 'SOH', 'RUL', 'cell_type', 'Cycle_phase']]
X = df_final[feature_cols]
y_rul = df_final['RUL']

# Create and fit the scaler
rul_scaler = RobustScaler()
rul_scaler.fit(X)

# Save the scaler
output_path = "/workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend/ML/battery_models/RUL_scaler.pkl"
joblib.dump(rul_scaler, output_path)

print(f"RUL_scaler.pkl has been recreated and saved to {output_path}")
