package com.loanguard.service;

import com.loanguard.dto.AnalyticsResponse;
import com.loanguard.model.LoanOutcome;
import com.loanguard.model.LoanStatus;
import com.loanguard.repository.LoanApplicationRepository;
import com.loanguard.repository.UserRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AnalyticsService {

    private final LoanApplicationRepository loanRepo;
    private final UserRepository userRepo;
    private final MongoTemplate mongoTemplate;

    public AnalyticsService(LoanApplicationRepository loanRepo, UserRepository userRepo, MongoTemplate mongoTemplate) {
        this.loanRepo      = loanRepo;
        this.userRepo      = userRepo;
        this.mongoTemplate = mongoTemplate;
    }

    public AnalyticsResponse getSystemAnalytics() {
        long total    = loanRepo.count();
        long approved = loanRepo.countByStatus(LoanStatus.APPROVED);
        long rejected = loanRepo.countByStatus(LoanStatus.REJECTED);
        long review   = loanRepo.countByStatus(LoanStatus.UNDER_REVIEW);
        long repaid   = loanRepo.countByActualOutcome(LoanOutcome.REPAID);
        long defaulted= loanRepo.countByActualOutcome(LoanOutcome.DEFAULTED);
        long pending  = loanRepo.countByActualOutcome(LoanOutcome.PENDING);
        long users    = userRepo.count();

        Double avgProb   = avgField("defaultProbability");
        Double avgRate   = avgFieldWithFilter("offeredInterestRate", Criteria.where("offeredInterestRate").gt(0));
        Double totalAmt  = sumFieldWithFilter("loanAmount", Criteria.where("status").is(LoanStatus.APPROVED.name()));
        Double avgReward = avgField("rewardReceived");

        double approvalRate  = total > 0 ? (double) approved / total * 100 : 0;
        double defaultRate   = (repaid + defaulted) > 0 ? (double) defaulted / (repaid + defaulted) * 100 : 0;
        double repaymentRate = (repaid + defaulted) > 0 ? (double) repaid   / (repaid + defaulted) * 100 : 0;

        return new AnalyticsResponse(
                total, approved, rejected, review,
                repaid, defaulted, pending, users,
                avgProb, avgRate, totalAmt, avgReward,
                approvalRate, defaultRate, repaymentRate
        );
    }

    private Double avgField(String field) {
        Aggregation agg = Aggregation.newAggregation(
            Aggregation.match(Criteria.where(field).exists(true).ne(null)),
            Aggregation.group().avg(field).as("avg")
        );
        AggregationResults<Map> results = mongoTemplate.aggregate(agg, "loan_applications", Map.class);
        Map result = results.getUniqueMappedResult();
        return result != null && result.get("avg") != null ? ((Number) result.get("avg")).doubleValue() : null;
    }

    private Double avgFieldWithFilter(String field, Criteria filter) {
        Aggregation agg = Aggregation.newAggregation(
            Aggregation.match(Criteria.where(field).exists(true).ne(null).andOperator(filter)),
            Aggregation.group().avg(field).as("avg")
        );
        AggregationResults<Map> results = mongoTemplate.aggregate(agg, "loan_applications", Map.class);
        Map result = results.getUniqueMappedResult();
        return result != null && result.get("avg") != null ? ((Number) result.get("avg")).doubleValue() : null;
    }

    private Double sumFieldWithFilter(String field, Criteria filter) {
        Aggregation agg = Aggregation.newAggregation(
            Aggregation.match(filter),
            Aggregation.group().sum(field).as("total")
        );
        AggregationResults<Map> results = mongoTemplate.aggregate(agg, "loan_applications", Map.class);
        Map result = results.getUniqueMappedResult();
        return result != null && result.get("total") != null ? ((Number) result.get("total")).doubleValue() : null;
    }
}
