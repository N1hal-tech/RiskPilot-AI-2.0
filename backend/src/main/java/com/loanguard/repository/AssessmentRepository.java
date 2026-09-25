package com.loanguard.repository;

import com.loanguard.model.Assessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends MongoRepository<Assessment, String> {
    List<Assessment> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Assessment> findTopByUserIdOrderByCreatedAtDesc(String userId);
}
