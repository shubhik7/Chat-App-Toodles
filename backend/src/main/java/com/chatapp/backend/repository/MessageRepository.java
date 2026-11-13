package com.chatapp.backend.repository;

import com.chatapp.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message,Long> {

    @Query("SELECT MAX(m.id) FROM Message m WHERE m.chat.id = :chatId")
    Long findMaxIdByChatId(@Param("chatId") Long chatId);

    List<Message> findByChat_IdAndIdGreaterThanOrderByIdAsc(Long chatId, Long afterId);
}
