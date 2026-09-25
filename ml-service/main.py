"""
FastAPI service exposing the trained RL agent.

Endpoints:
  POST /decide    — Get RL agent's lending decision with confidence routing
  POST /feedback  — Send outcome back to agent (online learning)
  GET  /health    — Health check
  GET  /stats     — Agent training statistics
  GET  /policy    — View the learned Q-table
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from rl_agent import (
    QLearningAgent, ACTIONS, ACTION_RATES, NUM_ACTIONS,
    get_state, state_to_key
)
from environment import LoanEnvironment

AGENT_PATH = "saved_model/rl_agent.json"

agent: Optional[QLearningAgent] = None
env = LoanEnvironment()

# ── Confidence Thresholds ───────────────────────────────────────
HIGH_CONFIDENCE_THRESHOLD   = 0.75   # Above this → auto decide
MEDIUM_CONFIDENCE_THRESHOLD = 0.50   # Between medium and high → suggest admin
# Below medium → force admin review


@asynccontextmanager
async def lifespan(app: FastAPI):
    global agent
    agent = QLearningAgent()
    if os.path.exists(AGENT_PATH):
        agent.load(AGENT_PATH)
        print(f"RL Agent loaded — {agent.training_episodes:,} episodes trained")
        print(f"  States: {len(agent.q_table)}")
        print(f"  Epsilon: {agent.epsilon}")
    else:
        print("No trained agent found — run train_agent.py first")
    yield
    if agent:
        agent.save(AGENT_PATH)
        print("Agent saved on shutdown")


app = FastAPI(
    title="RiskPilot AI RL Agent",
    version="3.0.0",
    description="RL agent with confidence-based admin escalation",
    lifespan=lifespan,
)


# ── Request / Response Schemas ──────────────────────────────────

class DecideRequest(BaseModel):
    annual_income:    float = Field(gt=0,  example=75000)
    loan_amount:      float = Field(gt=0,  example=25000)
    existing_debt:    float = Field(ge=0,  example=10000)
    employment_years: int   = Field(ge=0,  example=5)


class DecideResponse(BaseModel):
    action:              str
    interest_rate:       float
    risk_assessment:     str
    confidence:          float
    confidence_level:    str
    needs_admin_review:  bool
    escalation_reason:   str
    q_values:            list[float]
    action_labels:       list[str]
    state:               str
    default_probability: float
    advisory_message:    str
    admin_note:          str


class FeedbackRequest(BaseModel):
    annual_income:    float = Field(gt=0)
    loan_amount:      float = Field(gt=0)
    existing_debt:    float = Field(ge=0)
    employment_years: int   = Field(ge=0)
    action_taken:     str
    defaulted:        bool
    interest_rate:    float = Field(ge=0)


class FeedbackResponse(BaseModel):
    reward:            float
    q_values_before:   list[float]
    q_values_after:    list[float]
    total_episodes:    int
    message:           str


# ── Helper Functions ───────────────────────────────────────────

def compute_confidence_details(q_values):
    """
    Compute confidence level and determine if admin review is needed.

    Confidence is based on:
    1. Gap between best and second-best Q-value
    2. Whether state has been seen enough times
    3. Whether Q-values are all near zero (untrained state)
    """
    sorted_q = sorted(q_values, reverse=True)
    best_q   = sorted_q[0]
    second_q = sorted_q[1]
    worst_q  = sorted_q[-1]

    # Check if this is an untrained state (all zeros or near zero)
    max_abs = max(abs(q) for q in q_values)
    if max_abs < 0.5:
        return {
            "confidence": 0.3,
            "level": "LOW",
            "needs_review": True,
            "reason": "The RL agent has insufficient training data for this applicant profile. "
                      "Q-values are near zero, meaning the agent has not learned a reliable "
                      "policy for this state. Admin review is required for a safe decision.",
        }

    # Compute confidence from Q-value spread
    total_range = best_q - worst_q
    if total_range < 0.01:
        confidence = 0.35
    else:
        gap = best_q - second_q
        confidence = 0.5 + (gap / total_range) * 0.5

    confidence = min(max(confidence, 0.1), 0.99)

    # Check for conflicting signals
    # (e.g., APPROVE and REJECT both have high Q-values)
    approve_actions = [q_values[1], q_values[2], q_values[3]]  # APPROVE variants
    reject_q = q_values[0]
    best_approve = max(approve_actions)

    conflicting = abs(best_approve - reject_q) < total_range * 0.15
    if conflicting and confidence > 0.5:
        confidence = min(confidence, 0.55)

    # Determine confidence level
    if confidence >= HIGH_CONFIDENCE_THRESHOLD:
        level = "HIGH"
        needs_review = False
        reason = (
            "The RL agent has high confidence in this decision. "
            f"The best action's Q-value ({best_q:.2f}) is significantly higher "
            f"than alternatives. No admin review needed."
        )
    elif confidence >= MEDIUM_CONFIDENCE_THRESHOLD:
        level = "MEDIUM"
        needs_review = True
        reason = (
            "The RL agent has moderate confidence. "
            f"The gap between the best ({best_q:.2f}) and second-best "
            f"({second_q:.2f}) action is relatively small. "
            "We recommend admin review to verify this decision."
        )
    else:
        level = "LOW"
        needs_review = True
        reason = (
            "The RL agent has LOW confidence for this applicant profile. "
            f"Q-values are closely clustered (best: {best_q:.2f}, "
            f"second: {second_q:.2f}), indicating the agent is unsure. "
            "Admin review is REQUIRED before finalizing this decision."
        )

    return {
        "confidence": round(confidence, 3),
        "level": level,
        "needs_review": needs_review,
        "reason": reason,
    }


def get_risk_assessment(action, confidence, default_prob):
    if "APPROVE" in action:
        if default_prob < 0.25:
            return "LOW_RISK"
        elif default_prob < 0.45:
            return "MODERATE_RISK"
        else:
            return "ELEVATED_RISK"
    elif action == "REJECT":
        return "HIGH_RISK"
    else:
        return "UNCERTAIN"


def get_advisory_message(action, interest_rate, confidence_details, default_prob):
    conf_text = (
        "high confidence" if confidence_details["level"] == "HIGH"
        else "moderate confidence" if confidence_details["level"] == "MEDIUM"
        else "low confidence"
    )

    base_msg = ""
    if action == "APPROVE_STANDARD":
        base_msg = (
            f"RL Agent Suggestion: APPROVE at {interest_rate}% interest rate. "
            f"The agent has determined with {conf_text} that applicants with your "
            f"financial profile are reliable borrowers. "
            f"Estimated default risk: {default_prob*100:.1f}%."
        )
    elif action == "APPROVE_MODERATE":
        base_msg = (
            f"RL Agent Suggestion: APPROVE at {interest_rate}% interest rate. "
            f"The agent detected moderate risk with {conf_text}. "
            f"The adjusted rate compensates for risk. "
            f"Estimated default risk: {default_prob*100:.1f}%."
        )
    elif action == "APPROVE_HIGH":
        base_msg = (
            f"RL Agent Suggestion: APPROVE at {interest_rate}% interest rate. "
            f"Elevated risk detected. The higher rate accounts for lending risk. "
            f"Estimated default risk: {default_prob*100:.1f}%."
        )
    elif action == "REJECT":
        base_msg = (
            f"RL Agent Suggestion: REJECT. "
            f"The agent determined with {conf_text} that lending to this profile "
            f"leads to net negative outcomes. "
            f"Estimated default risk: {default_prob*100:.1f}%."
        )
    else:
        base_msg = (
            f"RL Agent Suggestion: MANUAL REVIEW. "
            f"The agent's {conf_text} suggests human evaluation is needed. "
            f"Estimated default risk: {default_prob*100:.1f}%."
        )

    if confidence_details["needs_review"]:
        base_msg += (
            f"\n\n⚠️ ADMIN REVIEW RECOMMENDED: {confidence_details['reason']}"
        )

    return base_msg


def get_admin_note(action, confidence_details, q_values, default_prob):
    """Generate a note specifically for the admin reviewer."""
    if not confidence_details["needs_review"]:
        return "No admin review needed. Agent confidence is high."

    sorted_actions = sorted(
        zip(ACTIONS, q_values),
        key=lambda x: x[1],
        reverse=True
    )

    note = (
        f"ESCALATION REASON: {confidence_details['reason']}\n\n"
        f"RL AGENT SUGGESTION: {action}\n"
        f"CONFIDENCE: {confidence_details['confidence']*100:.1f}% ({confidence_details['level']})\n"
        f"DEFAULT PROBABILITY: {default_prob*100:.1f}%\n\n"
        f"Q-VALUE RANKING:\n"
    )

    for act, qv in sorted_actions:
        marker = " ★ (suggested)" if act == action else ""
        note += f"  {act}: {qv:+.3f}{marker}\n"

    note += (
        f"\nRECOMMENDATION FOR ADMIN:\n"
        f"Please review the applicant's financial data and the agent's "
        f"Q-values above. The agent is uncertain — your decision will "
        f"also be fed back to improve the agent's future accuracy."
    )

    return note


# ── Endpoints ───────────────────────────────────────────────────

@app.post("/decide", response_model=DecideResponse)
def decide(req: DecideRequest):
    if agent is None:
        raise HTTPException(503, "RL Agent not loaded")

    applicant = {
        "annual_income":    req.annual_income,
        "loan_amount":      req.loan_amount,
        "existing_debt":    req.existing_debt,
        "employment_years": req.employment_years,
    }

    # Agent observes state
    state = get_state(applicant)

    # Agent chooses best action (no exploration during serving)
    action_idx = agent.get_best_action(state)
    action     = ACTIONS[action_idx]
    rate       = ACTION_RATES[action]
    q_values   = agent.get_q_values(state)

    # Compute confidence and escalation
    confidence_details = compute_confidence_details(q_values)

    # If low confidence, override action to MANUAL_REVIEW
    if confidence_details["level"] == "LOW":
        # Keep the original suggestion but route to review
        pass  # action stays as agent's suggestion for admin to see

    # Estimate default probability
    default_prob = env.compute_base_default_probability(applicant)

    risk = get_risk_assessment(action, confidence_details["confidence"], default_prob)
    msg  = get_advisory_message(action, rate, confidence_details, default_prob)
    admin_note = get_admin_note(action, confidence_details, q_values, default_prob)

    return DecideResponse(
        action=action,
        interest_rate=rate,
        risk_assessment=risk,
        confidence=confidence_details["confidence"],
        confidence_level=confidence_details["level"],
        needs_admin_review=confidence_details["needs_review"],
        escalation_reason=confidence_details["reason"],
        q_values=[round(q, 4) for q in q_values],
        action_labels=ACTIONS,
        state=state_to_key(state),
        default_probability=round(default_prob, 4),
        advisory_message=msg,
        admin_note=admin_note,
    )


@app.post("/feedback", response_model=FeedbackResponse)
def feedback(req: FeedbackRequest):
    if agent is None:
        raise HTTPException(503, "RL Agent not loaded")

    applicant = {
        "annual_income":    req.annual_income,
        "loan_amount":      req.loan_amount,
        "existing_debt":    req.existing_debt,
        "employment_years": req.employment_years,
    }

    state = get_state(applicant)

    if req.action_taken not in ACTIONS:
        raise HTTPException(400, f"Invalid action: {req.action_taken}")
    action_idx = ACTIONS.index(req.action_taken)

    q_before = list(agent.get_q_values(state))

    reward = env.compute_reward(
        req.action_taken, req.interest_rate,
        req.defaulted, req.loan_amount
    )

    agent.update(state, action_idx, reward, state)

    q_after = list(agent.get_q_values(state))

    if agent.training_episodes % 100 == 0:
        agent.save(AGENT_PATH)

    outcome = "defaulted" if req.defaulted else "repaid"

    return FeedbackResponse(
        reward=round(reward, 4),
        q_values_before=[round(q, 4) for q in q_before],
        q_values_after=[round(q, 4) for q in q_after],
        total_episodes=agent.training_episodes,
        message=(
            f"Agent updated. Borrower {outcome}. "
            f"Reward: {reward:+.2f}. "
            f"The agent has now trained on {agent.training_episodes:,} episodes."
        ),
    )


@app.get("/health")
def health():
    return {
        "status":       "healthy",
        "agent_loaded": agent is not None,
        "episodes":     agent.training_episodes if agent else 0,
        "states":       len(agent.q_table) if agent else 0,
    }


@app.get("/stats")
def stats():
    if agent is None:
        raise HTTPException(503, "Agent not loaded")
    return agent.get_stats()


@app.get("/policy")
def policy():
    if agent is None:
        raise HTTPException(503, "Agent not loaded")

    formatted = {}
    for state_key, q_vals in agent.q_table.items():
        best_idx = q_vals.index(max(q_vals))
        conf = compute_confidence_details(q_vals)
        formatted[state_key] = {
            "q_values":      [round(q, 3) for q in q_vals],
            "best_action":   ACTIONS[best_idx],
            "rate":          ACTION_RATES[ACTIONS[best_idx]],
            "confidence":    conf["confidence"],
            "needs_review":  conf["needs_review"],
        }
    return {
        "total_states": len(formatted),
        "actions":      ACTIONS,
        "policy":       formatted,
    }

