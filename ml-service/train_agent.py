"""
Training script for the RiskPilot AI RL Agent.

Runs the agent through simulated loan scenarios so it learns
the optimal lending policy through trial and error.
"""

from environment import LoanEnvironment
from rl_agent import (
    QLearningAgent, ACTIONS, ACTION_RATES,
    get_state, state_to_key
)

AGENT_PATH = "saved_model/rl_agent.json"


def train(episodes=100_000, report_every=10_000):
    print("=" * 60)
    print("  RiskPilot AI RL Agent Training")
    print("=" * 60)
    print()

    env   = LoanEnvironment(seed=42)
    agent = QLearningAgent(alpha=0.1, gamma=0.95, epsilon=0.3)

    # Track metrics per reporting window
    window_rewards    = []
    window_defaults   = 0
    window_approvals  = 0
    window_rejections = 0
    window_reviews    = 0

    for ep in range(1, episodes + 1):

        # 1. Sample a random applicant
        applicant = env.sample_applicant()

        # 2. Agent observes state
        state = get_state(applicant)

        # 3. Agent chooses action (with exploration)
        action_idx = agent.choose_action(state, explore=True)
        action     = ACTIONS[action_idx]
        rate       = ACTION_RATES[action]

        # 4. Environment simulates outcome
        outcome = env.simulate_outcome(applicant, rate)
        defaulted = outcome["defaulted"]

        # 5. Environment computes reward
        reward = env.compute_reward(
            action, rate, defaulted,
            applicant["loan_amount"]
        )

        # 6. Agent learns from this experience
        # For single-step episodic: next_state = same state (terminal)
        agent.update(state, action_idx, reward, state)

        # 7. Decay exploration over time
        agent.decay_epsilon(min_epsilon=0.05, decay_rate=0.99995)

        # Track metrics
        window_rewards.append(reward)
        if defaulted:
            window_defaults += 1
        if "APPROVE" in action:
            window_approvals += 1
        elif action == "REJECT":
            window_rejections += 1
        else:
            window_reviews += 1

        # Report progress
        if ep % report_every == 0:
            avg_r = sum(window_rewards) / len(window_rewards)
            total_decisions = window_approvals + window_rejections + window_reviews
            print(f"Episode {ep:>7,}")
            print(f"  Avg Reward:   {avg_r:>8.3f}")
            print(f"  Epsilon:      {agent.epsilon:>8.4f}")
            print(f"  Defaults:     {window_defaults:>5} / {total_decisions}")
            print(f"  Approvals:    {window_approvals:>5}")
            print(f"  Rejections:   {window_rejections:>5}")
            print(f"  Reviews:      {window_reviews:>5}")
            print(f"  States seen:  {len(agent.q_table)}")
            print()

            # Reset window
            window_rewards    = []
            window_defaults   = 0
            window_approvals  = 0
            window_rejections = 0
            window_reviews    = 0

    # Save trained agent
    agent.save(AGENT_PATH)

    print("=" * 60)
    print(f"  Training Complete!")
    print(f"  Episodes:       {agent.training_episodes:,}")
    print(f"  Total Reward:   {agent.total_reward:,.2f}")
    print(f"  States Learned: {len(agent.q_table)}")
    print(f"  Final Epsilon:  {agent.epsilon:.4f}")
    print(f"  Saved to:       {AGENT_PATH}")
    print("=" * 60)

    # Show sample policy
    print("\n── Sample Policy Decisions ──")
    env2 = LoanEnvironment(seed=99)
    for i in range(10):
        app   = env2.sample_applicant()
        state = get_state(app)
        action_idx = agent.get_best_action(state)
        action = ACTIONS[action_idx]
        q_vals = agent.get_q_values(state)
        conf   = agent.get_policy_confidence(state)

        income = app["annual_income"]
        loan   = app["loan_amount"]
        debt   = app["existing_debt"]
        emp    = app["employment_years"]

        print(
            f"  Applicant {i+1}: "
            f"Income=${income:>8,.0f}  Loan=${loan:>7,.0f}  "
            f"Debt=${debt:>7,.0f}  Emp={emp:>2}yrs  "
            f"→ {action:<20} (conf={conf:.2f})"
        )


if __name__ == "__main__":
    train()