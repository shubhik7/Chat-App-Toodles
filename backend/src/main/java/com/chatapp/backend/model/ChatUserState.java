package com.chatapp.backend.model;

import jakarta.persistence.*;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"chat_id", "user_id"}))
public class ChatUserState {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chat_id", nullable = false)
    private Long chatId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private boolean hidden = false;

    private Long clearedUpToMessageId = 0L;

    private Long removedAtMessageId;

    public ChatUserState() {
    }

    public ChatUserState(Long chatId, Long userId) {
        this.chatId = chatId;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public Long getChatId() {
        return chatId;
    }

    public Long getUserId() {
        return userId;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public Long getClearedUpToMessageId() {
        return clearedUpToMessageId;
    }

    public void setClearedUpToMessageId(Long clearedUpToMessageId) {
        this.clearedUpToMessageId = clearedUpToMessageId;
    }

    public Long getRemovedAtMessageId() {
        return removedAtMessageId;
    }

    public void setRemovedAtMessageId(Long removedAtMessageId) {
        this.removedAtMessageId = removedAtMessageId;
    }
}
