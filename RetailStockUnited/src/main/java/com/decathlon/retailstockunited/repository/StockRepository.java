package com.decathlon.retailstockunited.repository;

import com.decathlon.retailstockunited.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    
    Optional<Stock> findByProductId(String productId);
    
    Optional<Stock> findByProductIdAndLocation(String productId, String location);
    
    /**
     * Find stock by product ID with pessimistic write lock to prevent concurrent updates
     * 
     * @param productId The product ID to search for
     * @return Optional Stock entity with exclusive lock
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Stock s WHERE s.productId = :productId")
    Optional<Stock> findByProductIdWithPessimisticLock(@Param("productId") String productId);
}