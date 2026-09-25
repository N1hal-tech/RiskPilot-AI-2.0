"""
Q-Learning RL Agent for loan decision-making.

The agent learns a policy that maps applicant states to optimal
lending actions (approve at various rates, reject, or review).

This is a tabular Q-learning agent with epsilon-greedy exploration.
"""

import json
import os
import random
import numpy as np
from typing import Optional


# ── Action Space ─────────────────────────────────────────────────

ACTIONS = [
    "REJECT",               # 0 — Decline the application
    "APPROVE_STANDARD",     # 1 — Approve at 8% interest
    "APPROVE_MODERATE",     # 2 — Approve at 12% interest
    "APPROVE_HIGH",         # 3 — Approve at 16% interest
    "MANUAL_REVIEW",        # 4 — Flag for human review
]

ACTION_RATES = {
    "REJECT":            0.0,
    "APPROVE_STANDARD":  8.0,
    "APPROVE_MODERATE": 12.0,
    "APPROVE_HIGH":     16.0,
    "MANUAL_REVIEW":     0.0,
}

NUM_ACTIONS = len(ACTIONS)


# ── State Discretization ────────────────────────────────────────

def bucketize(value, boundaries):
    """Assign a value to a discrete bucket."""
    for i, b in enumerate(boundaries):
        if value < b:
            return i
    return len(boundaries)


def get_state(applicant):
    """
    Convert continuous applicant features into a discrete state tuple.

    State = (income_bucket, dti_bucket, lti_bucket, emp_bucket)

    Each dimension has 5 buckets → total 5^4 = 625 possible states.
    """
    income = applicant["annual_income"]
    loan   = applicant["loan_amount"]
    debt   = applicant["existing_debt"]
    emp    = applicant["employment_years"]

    dti = debt / max(income, 1)
    lti = loan / max(income, 1)

    income_bucket = bucketize(income, [30_000, 50_000, 80_000, 120_000])
    dti_bucket    = bucketize(dti,    [0.1, 0.25, 0.4, 0.6])
    lti_bucket    = bucketize(lti,    [0.15, 0.3, 0.5, 0.8])
    emp_bucket    = bucketize(emp,    [2, 5, 10, 15])

    return (income_bucket, dti_bucket, lti_bucket, emp_bucket)


def state_to_key(state):
    """Convert state tuple to string key for Q-table."""
    return str(state)


# ── Q-Learning Agent ────────────────────────────────────────────

class QLearningAgent:
    """
    Tabular Q-Learning agent.

    Maintains a Q-table: state → [Q(s,a0), Q(s,a1), ..., Q(s,a4)]
    """

    def __init__(self, alpha=0.1, gamma=0.95, epsilon=0.15):
        self.q_table = {}
        self.alpha   = alpha     # Learning rate
        self.gamma   = gamma     # Discount factor
        self.epsilon = epsilon   # Exploration rate
        self.training_episodes = 0
        self.total_reward = 0.0

    def _ensure_state(self, state_key):
        """Initialize Q-values for unseen states."""
        if state_key not in self.q_table:
            self.q_table[state_key] = [0.0] * NUM_ACTIONS

    def choose_action(self, state, explore=True):
        """
        Epsilon-greedy action selection.

        With probability epsilon: explore (random action).
        Otherwise: exploit (best known action).
        """
        state_key = state_to_key(state)
        self._ensure_state(state_key)

        if explore and random.random() < self.epsilon:
            return random.randint(0, NUM_ACTIONS - 1)
        else:
            q_values = self.q_table[state_key]
            max_q = max(q_values)
            # Break ties randomly
            best_actions = [i for i, q in enumerate(q_values) if q == max_q]
            return random.choice(best_actions)

    def update(self, state, action, reward, next_state):
        """
        Q-Learning update rule:

        Q(s, a) ← Q(s, a) + α [r + γ max_a' Q(s', a') - Q(s, a)]
        """
        state_key = state_to_key(state)
        next_key  = state_to_key(next_state)

        self._ensure_state(state_key)
        self._ensure_state(next_key)

        q_old      = self.q_table[state_key][action]
        q_next_max = max(self.q_table[next_key])

        q_new = q_old + self.alpha * (reward + self.gamma * q_next_max - q_old)

        self.q_table[state_key][action] = round(q_new, 4)
        self.training_episodes += 1
        self.total_reward += reward

    def get_q_values(self, state):
        """Get Q-values for a state."""
        state_key = state_to_key(state)
        self._ensure_state(state_key)
        return self.q_table[state_key]

    def get_best_action(self, state):
        """Get the greedy best action (no exploration)."""
        return self.choose_action(state, explore=False)

    def get_policy_confidence(self, state):
        """
        Compute confidence in the chosen action.

        Higher difference between best and second-best Q-value
        means more confidence.
        """
        q_values = self.get_q_values(state)
        sorted_q = sorted(q_values, reverse=True)

        if sorted_q[0] == sorted_q[1] == 0:
            return 0.5  # No learning yet for this state

        total_range = sorted_q[0] - sorted_q[-1]
        if total_range == 0:
            return 0.5

        gap = sorted_q[0] - sorted_q[1]
        return min(0.5 + (gap / total_range) * 0.5, 1.0)

    def decay_epsilon(self, min_epsilon=0.05, decay_rate=0.9995):
        """Gradually reduce exploration."""
        self.epsilon = max(min_epsilon, self.epsilon * decay_rate)

    def save(self, path):
        """Save the agent to disk."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        data = {
            "q_table":           self.q_table,
            "alpha":             self.alpha,
            "gamma":             self.gamma,
            "epsilon":           self.epsilon,
            "training_episodes": self.training_episodes,
            "total_reward":      round(self.total_reward, 2),
        }
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    def load(self, path):
        """Load the agent from disk."""
        with open(path, "r") as f:
            data = json.load(f)
        self.q_table           = data["q_table"]
        self.alpha             = data.get("alpha", 0.1)
        self.gamma             = data.get("gamma", 0.95)
        self.epsilon           = data.get("epsilon", 0.15)
        self.training_episodes = data.get("training_episodes", 0)
        self.total_reward      = data.get("total_reward", 0.0)

    def get_stats(self):
        """Return training statistics."""
        return {
            "total_states":    len(self.q_table),
            "total_episodes":  self.training_episodes,
            "total_reward":    round(self.total_reward, 2),
            "avg_reward":      round(self.total_reward / max(self.training_episodes, 1), 4),
            "epsilon":         round(self.epsilon, 4),
            "alpha":           self.alpha,
            "gamma":           self.gamma,
        }