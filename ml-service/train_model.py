"""
Generates synthetic loan-default data and trains a Logistic Regression
pipeline (StandardScaler → LogisticRegression).  The saved model is
loaded at startup by main.py.
"""

import os, numpy as np, pandas as pd, joblib
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report


def generate_data(n: int = 5_000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    income   = rng.lognormal(mean=10.9, sigma=0.45, size=n).clip(15_000, 500_000)
    loan     = rng.lognormal(mean=9.8,  sigma=0.70, size=n).clip(1_000,  200_000)
    debt     = rng.exponential(scale=12_000, size=n).clip(0, 300_000)
    emp_yrs  = rng.gamma(shape=3, scale=3, size=n).clip(0, 40).astype(int)

    dti   = debt / income
    lti   = loan / income
    total = (debt + loan) / income

    log_odds = (
        -2.5
        + 3.5 * dti
        + 2.8 * lti
        + 1.2 * total
        - 0.12 * emp_yrs
        + rng.normal(0, 0.6, n)
    )
    prob    = 1 / (1 + np.exp(-log_odds))
    default = (prob > 0.5).astype(int)

    # 5 % label noise for realism
    flip = rng.random(n) < 0.05
    default[flip] = 1 - default[flip]

    return pd.DataFrame({
        "annual_income":   income,
        "loan_amount":     loan,
        "existing_debt":   debt,
        "employment_years": emp_yrs,
        "debt_to_income":  dti,
        "loan_to_income":  lti,
        "total_obligation": total,
        "default":         default,
    })


def train() -> None:
    df = generate_data()

    features = ["debt_to_income", "loan_to_income",
                "total_obligation", "employment_years"]
    X = df[features]
    y = df["default"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("scaler",     StandardScaler()),
        ("classifier", LogisticRegression(max_iter=1_000, random_state=42)),
    ])
    pipeline.fit(X_train, y_train)

    print("-- Evaluation on hold-out set --")
    print(classification_report(y_test, pipeline.predict(X_test),
                                target_names=["No Default", "Default"]))

    os.makedirs("saved_model", exist_ok=True)
    joblib.dump(pipeline, "saved_model/loan_default_model.pkl")
    print("Model saved → saved_model/loan_default_model.pkl")


if __name__ == "__main__":
    train()