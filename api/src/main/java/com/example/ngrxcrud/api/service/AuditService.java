package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.model.AuditLog;
import com.example.ngrxcrud.api.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(UUID userId, String action, String entityName, String entityId, String oldValues,
            String newValues, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .oldValues(oldValues)
                .newValues(newValues)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }
}
