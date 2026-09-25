package com.loanguard.model;

/**
 * Embedded sub-document shared between Assessment and Simulation.
 * Captures the financial inputs fed to the RL engine.
 */
public class FinancialProfile {
    private Double annualIncome;
    private Double existingDebt;
    private Double loanAmount;
    private Integer employmentYears;
    private Integer loanTermMonths;
    private String loanPurpose;

    public FinancialProfile() {}

    public FinancialProfile(Double annualIncome, Double existingDebt, Double loanAmount,
                            Integer employmentYears, Integer loanTermMonths, String loanPurpose) {
        this.annualIncome    = annualIncome;
        this.existingDebt    = existingDebt;
        this.loanAmount      = loanAmount;
        this.employmentYears = employmentYears;
        this.loanTermMonths  = loanTermMonths;
        this.loanPurpose     = loanPurpose;
    }

    public Double getAnnualIncome()               { return annualIncome; }
    public void setAnnualIncome(Double v)         { this.annualIncome = v; }
    public Double getExistingDebt()               { return existingDebt; }
    public void setExistingDebt(Double v)         { this.existingDebt = v; }
    public Double getLoanAmount()                 { return loanAmount; }
    public void setLoanAmount(Double v)           { this.loanAmount = v; }
    public Integer getEmploymentYears()           { return employmentYears; }
    public void setEmploymentYears(Integer v)     { this.employmentYears = v; }
    public Integer getLoanTermMonths()            { return loanTermMonths; }
    public void setLoanTermMonths(Integer v)      { this.loanTermMonths = v; }
    public String getLoanPurpose()                { return loanPurpose; }
    public void setLoanPurpose(String v)          { this.loanPurpose = v; }
}
