package com.chatapp.backend.repository;

import com.chatapp.backend.model.ChatUserState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatUserStateRepository extends JpaRepository<ChatUserState, Long> {
    Optional<ChatUserState> findByChatIdAndUserId(Long chatId, Long userId);

    List<ChatUserState> findByUserIdAndHiddenTrue(Long userId);

    List<ChatUserState> findByChatIdAndHiddenTrue(Long chatId);

    List<ChatUserState> findByUserIdAndRemovedAtMessageIdIsNotNullAndHiddenFalse(Long userId);
}
