-- schema.sql

CREATE DATABASE IF NOT EXISTS loangaurd;
USE loangaurd;

-- ══════════════════════════════════════════════════════
-- USERS TABLE (with roles)
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
    id            BIGINT       AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    auth_provider VARCHAR(20)  NULL,
    provider_subject VARCHAR(255) NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    phone         VARCHAR(20)  NULL,
    address       VARCHAR(500) NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login    TIMESTAMP    NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ══════════════════════════════════════════════════════
-- LOAN APPLICATIONS TABLE (extended for RL)
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS loan_application (
    id                    BIGINT           AUTO_INCREMENT PRIMARY KEY,
    user_id               BIGINT           NOT NULL,
    applicant_name        VARCHAR(255)     NOT NULL,
    applicant_email       VARCHAR(255)     NOT NULL,
    application_ref       VARCHAR(20)      NOT NULL UNIQUE,
    annual_income         DOUBLE           NOT NULL,
    loan_amount           DOUBLE           NOT NULL,
    existing_debt         DOUBLE           NOT NULL,
    employment_years      INT              NOT NULL,
    loan_purpose          VARCHAR(100)     NULL,
    loan_term_months      INT              NULL DEFAULT 36,
    rl_action             VARCHAR(30)      NULL,
    offered_interest_rate DOUBLE           NULL,
    default_probability   DOUBLE           NULL,
    risk_level            VARCHAR(20)      NULL,
    status                VARCHAR(20)      NULL,
    advisory_message      VARCHAR(1000)    NULL,
    rl_state              VARCHAR(100)     NULL,
    q_values              VARCHAR(500)     NULL,
    confidence_level      VARCHAR(20)      NULL,
    needs_admin_review    BOOLEAN          NOT NULL DEFAULT FALSE,
    escalation_reason     VARCHAR(1000)    NULL,
    admin_note            VARCHAR(2000)    NULL,
    rl_suggested_action   VARCHAR(30)      NULL,
    admin_decision        VARCHAR(30)      NULL,
    admin_interest_rate   DOUBLE           NULL,
    actual_outcome        VARCHAR(20)      NULL DEFAULT 'PENDING',
    reward_received       DOUBLE           NULL,
    feedback_given        BOOLEAN          NOT NULL DEFAULT FALSE,
    reviewed_by           BIGINT           NULL,
    reviewed_at           TIMESTAMP        NULL,
    review_notes          VARCHAR(1000)    NULL,
    created_at            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_loan_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_loan_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ══════════════════════════════════════════════════════
-- NOTIFICATIONS TABLE
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     VARCHAR(1000) NOT NULL,
    type        VARCHAR(30)  NOT NULL,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    link        VARCHAR(255) NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ══════════════════════════════════════════════════════
-- AUDIT LOG TABLE
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NULL,
    action      VARCHAR(50)  NOT NULL,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   BIGINT       NULL,
    details     VARCHAR(2000) NULL,
    ip_address  VARCHAR(45)  NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ══════════════════════════════════════════════════════
-- LOAN COMMENTS TABLE
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS loan_comments (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    loan_id     BIGINT       NOT NULL,
    user_id     BIGINT       NOT NULL,
    comment     VARCHAR(2000) NOT NULL,
    is_internal BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_loan FOREIGN KEY (loan_id) REFERENCES loan_application(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ══════════════════════════════════════════════════════
-- DOCUMENTS TABLE
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS documents (
    id            BIGINT       AUTO_INCREMENT PRIMARY KEY,
    loan_id       BIGINT       NOT NULL,
    user_id       BIGINT       NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    file_type     VARCHAR(50)  NOT NULL,
    file_size     BIGINT       NOT NULL,
    doc_type      VARCHAR(50)  NOT NULL,
    verified      BOOLEAN      NOT NULL DEFAULT FALSE,
    verified_by   BIGINT       NULL,
    verified_at   TIMESTAMP    NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_loan     FOREIGN KEY (loan_id)     REFERENCES loan_application(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ══════════════════════════════════════════════════════
-- RL TRAINING SESSIONS TABLE
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rl_training_sessions (
    id              BIGINT    AUTO_INCREMENT PRIMARY KEY,
    triggered_by    BIGINT    NULL,
    episodes        INT       NOT NULL,
    total_reward    DOUBLE    NULL,
    avg_reward      DOUBLE    NULL,
    states_learned  INT       NULL,
    final_epsilon   DOUBLE    NULL,
    duration_ms     BIGINT    NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'RUNNING',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP NULL,
    CONSTRAINT fk_rltrain_user FOREIGN KEY (triggered_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ══════════════════════════════════════════════════════
-- CHAT MESSAGES TABLE
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS chat_messages (
    id          BIGINT        AUTO_INCREMENT PRIMARY KEY,
    session_id  VARCHAR(100)  NOT NULL,
    user_id     VARCHAR(255)  NULL,
    role        VARCHAR(20)   NOT NULL,
    content     TEXT          NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_chat_role CHECK (role IN ('USER', 'ASSISTANT'))
) ENGINE=InnoDB;

-- ══════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════

CREATE INDEX idx_loan_user_id     ON loan_application(user_id);
CREATE INDEX idx_loan_status      ON loan_application(status);
CREATE INDEX idx_loan_outcome     ON loan_application(actual_outcome);
CREATE INDEX idx_loan_ref         ON loan_application(application_ref);
CREATE INDEX idx_notif_user       ON notifications(user_id);
CREATE INDEX idx_notif_read       ON notifications(is_read);
CREATE INDEX idx_audit_user       ON audit_logs(user_id);
CREATE INDEX idx_audit_action     ON audit_logs(action);
CREATE INDEX idx_audit_created    ON audit_logs(created_at);
CREATE INDEX idx_comment_loan     ON loan_comments(loan_id);
CREATE INDEX idx_doc_loan         ON documents(loan_id);
CREATE INDEX idx_chat_session     ON chat_messages(session_id);
CREATE INDEX idx_chat_user        ON chat_messages(user_id);
CREATE INDEX idx_chat_created     ON chat_messages(created_at);

-- ══════════════════════════════════════════════════════
-- SEED DEFAULT ADMIN USER
-- ══════════════════════════════════════════════════════

INSERT INTO users (full_name, email, password, role) VALUES
    ('RiskPilot AI Admin', 'admin@loanguard.com',
     '$2a$12$LJ3m4ys3uz0kR2DSbEqJpOTSAE0WJxMBBIB9lE8a5wZCmp0p3hCYi',
     'ADMIN')
ON DUPLICATE KEY UPDATE role = 'ADMIN';
-- Password: admin123