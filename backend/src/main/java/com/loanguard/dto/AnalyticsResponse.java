package com.loanguard.dto;

public record AnalyticsResponse(
        long totalApplications,
        long totalApproved,
        long totalRejected,
        long totalUnderReview,
        long totalRepaid,
        long totalDefaulted,
        long totalPending,
        long totalUsers,
        Double avgDefaultProbability,
        Double avgInterestRate,
        Double totalApprovedAmount,
        Double avgReward,
        double approvalRate,
        double defaultRate,
        double repaymentRate
) {}