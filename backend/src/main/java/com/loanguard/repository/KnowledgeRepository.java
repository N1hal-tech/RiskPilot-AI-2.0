package com.loanguard.repository;

import com.loanguard.model.KnowledgeEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeRepository extends MongoRepository<KnowledgeEntry, String> {
    List<KnowledgeEntry> findByCategory(String category);
    boolean existsByTitle(String title);
}
