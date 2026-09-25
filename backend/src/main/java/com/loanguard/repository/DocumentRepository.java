package com.loanguard.repository;

import com.loanguard.model.LoanDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends MongoRepository<LoanDocument, String> {
    List<LoanDocument> findByLoanIdOrderByCreatedAtDesc(String loanId);
    Optional<LoanDocument> findById(String id);
}