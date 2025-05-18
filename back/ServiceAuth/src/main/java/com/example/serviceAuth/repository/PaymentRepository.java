package com.example.serviceAuth.repository;

import com.example.serviceAuth.model.Payment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);
    Payment findByPaymentId(String paymentId);
    @Modifying
    @Query("DELETE FROM Payment p WHERE p.user.id = :userId")
    @Transactional
    void deleteByUserId(@Param("userId") Long userId);
}