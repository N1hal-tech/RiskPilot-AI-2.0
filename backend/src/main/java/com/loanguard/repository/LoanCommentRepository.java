package com.loanguard.repository;

import com.loanguard.model.LoanComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanCommentRepository extends MongoRepository<LoanComment, String> {
    List<LoanComment> findByLoanIdOrderByCreatedAtAsc(String loanId);
    List<LoanComment> findByLoanIdAndIsInternalFalseOrderByCreatedAtAsc(String loanId);
}