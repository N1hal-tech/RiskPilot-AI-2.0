package com.loanguard.repository;

import com.loanguard.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    long countByUserIdAndIsReadFalse(String userId);

    @Query("{ 'userId': ?0, 'isRead': false }")
    @Update("{ '$set': { 'isRead': true } }")
    void markAllReadByUserId(String userId);
}