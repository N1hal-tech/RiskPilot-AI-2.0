package com.loanguard.repository;

import com.loanguard.model.LoanApplication;
import com.loanguard.model.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanApplicationRepository extends MongoRepository<LoanApplication, String> {
    List<LoanApplication> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<LoanApplication> findByApplicationRef(String ref);
    Page<LoanApplication> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<LoanApplication> findByStatusOrderByCreatedAtDesc(LoanStatus status, Pageable pageable);
    long countByStatus(LoanStatus status);
    long countByActualOutcome(com.loanguard.model.LoanOutcome outcome);
    List<LoanApplication> findByNeedsAdminReviewTrueAndStatusOrderByCreatedAtDesc(LoanStatus status);
    long countByNeedsAdminReviewTrueAndStatus(LoanStatus status);
}