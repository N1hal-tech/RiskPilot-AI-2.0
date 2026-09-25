package com.loanguard.repository;

import com.loanguard.model.Simulation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationRepository extends MongoRepository<Simulation, String> {
    List<Simulation> findByUserIdOrderByCreatedAtDesc(String userId);
}
