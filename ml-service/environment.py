"""
Loan Environment Simulator.

Simulates whether a borrower repays or defaults based on their
financial profile and the interest rate offered.

This is the "world" the RL agent interacts with during training.
"""

import random
import math


class LoanEnvironment:
    """
    Simulates loan outcomes.

    Higher debt-to-income → more likely to default.
    Higher interest rate  → more likely to default (harder to repay).
    Longer employment     → less likely to default.
    """

    def __init__(self, seed=None):
        if seed is not None:
            random.seed(seed)

    def sample_applicant(self):
        """Generate a random loan applicant."""
        income = random.uniform(20_000, 200_000)
        loan   = random.uniform(1_000, 100_000)
        debt   = random.uniform(0, 80_000)
        emp    = random.randint(0, 25)
        return {
            "annual_income":    income,
            "loan_amount":      loan,
            "existing_debt":    debt,
            "employment_years": emp,
        }

    def compute_base_default_probability(self, applicant):
        """
        Compute the inherent risk of this applicant.
        This simulates real-world credit risk.
        """
        income = applicant["annual_income"]
        loan   = applicant["loan_amount"]
        debt   = applicant["existing_debt"]
        emp    = applicant["employment_years"]

        dti   = debt / max(income, 1)
        lti   = loan / max(income, 1)
        total = (debt + loan) / max(income, 1)

        # Logistic-style base probability
        log_odds = (
            -2.0
            + 3.0 * dti
            + 2.5 * lti
            + 1.5 * total
            - 0.08 * emp
            # + random.gauss(0, 0.3)  # Remove noise for consistent results
        )
        return 1.0 / (1.0 + math.exp(-log_odds))

    def simulate_outcome(self, applicant, interest_rate):
        """
        Simulate whether the borrower defaults.

        Higher interest rate increases default probability
        (harder to repay).
        """
        base_prob = self.compute_base_default_probability(applicant)

        # Interest rate effect: higher rates make repayment harder
        rate_effect = 0.0
        if interest_rate > 12.0:
            rate_effect = (interest_rate - 12.0) * 0.02
        elif interest_rate < 8.0:
            rate_effect = -0.03

        final_prob = max(0.01, min(0.99, base_prob + rate_effect))

        defaulted = random.random() < final_prob

        return {
            "defaulted":           defaulted,
            "base_default_prob":   round(base_prob, 4),
            "final_default_prob":  round(final_prob, 4),
            "interest_rate":       interest_rate,
        }

    def compute_reward(self, action, interest_rate, defaulted, loan_amount):
        """
        Compute the business reward for the RL agent's decision.

        The agent learns to maximize this over time.
        """

        if action == "REJECT":
            if defaulted:
                # Correctly rejected a risky borrower → good decision
                return 8.0
            else:
                # Rejected someone who would have repaid → lost business
                return -10.0

        elif action == "MANUAL_REVIEW":
            if defaulted:
                # Caught a risky one through review → moderate positive
                return 3.0
            else:
                # Sent a good borrower to slow review → small opportunity cost
                return 1.0

        else:
            # Approved (at some interest rate)
            if defaulted:
                # Approved and they defaulted → significant loss
                loss = -15.0 - (loan_amount / 10_000.0)
                return max(loss, -30.0)
            else:
                # Approved and they repaid → profit from interest
                profit = 5.0 + (interest_rate * 0.8)
                return min(profit, 20.0)