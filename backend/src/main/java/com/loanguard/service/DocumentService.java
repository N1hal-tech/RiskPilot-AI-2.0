package com.loanguard.service;

import com.loanguard.dto.DocumentResponse;
import com.loanguard.exception.ApiException;
import com.loanguard.model.LoanApplication;
import com.loanguard.model.LoanDocument;
import com.loanguard.model.User;
import com.loanguard.repository.DocumentRepository;
import com.loanguard.repository.LoanApplicationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository docRepo;
    private final LoanApplicationRepository loanRepo;

    public DocumentService(DocumentRepository docRepo, LoanApplicationRepository loanRepo) {
        this.docRepo  = docRepo;
        this.loanRepo = loanRepo;
    }

    public DocumentResponse uploadMeta(User user, String loanId, String fileName,
                                       String fileType, Long fileSize, String docType) {
        LoanApplication loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new ApiException("Loan not found", HttpStatus.NOT_FOUND));

        if (!loan.getUserId().equals(user.getId()))
            throw new ApiException("Not authorized", HttpStatus.FORBIDDEN);

        LoanDocument doc = new LoanDocument();
        doc.setLoanId(loan.getId());
        doc.setUserId(user.getId());
        doc.setFileName(fileName);
        doc.setFileType(fileType);
        doc.setFileSize(fileSize);
        doc.setDocType(docType);

        return DocumentResponse.from(docRepo.save(doc));
    }

    public DocumentResponse verify(User admin, String docId) {
        LoanDocument doc = docRepo.findById(docId)
                .orElseThrow(() -> new ApiException("Document not found", HttpStatus.NOT_FOUND));

        doc.setVerified(true);
        doc.setVerifiedById(admin.getId());
        doc.setVerifiedByName(admin.getFullName());
        doc.setVerifiedAt(LocalDateTime.now());

        return DocumentResponse.from(docRepo.save(doc));
    }

    public List<DocumentResponse> getByLoan(String loanId) {
        return docRepo.findByLoanIdOrderByCreatedAtDesc(loanId).stream()
                .map(DocumentResponse::from).toList();
    }
}
