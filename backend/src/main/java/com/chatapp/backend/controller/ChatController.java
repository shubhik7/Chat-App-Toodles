package com.chatapp.backend.controller;

import com.chatapp.backend.dto.CreateGroupDTO;
import com.chatapp.backend.dto.SendMessageReqDTO;
import com.chatapp.backend.model.Chat;
import com.chatapp.backend.model.ChatUserState;
import com.chatapp.backend.model.Message;
import com.chatapp.backend.model.User;
import com.chatapp.backend.repository.ChatRepository;
import com.chatapp.backend.repository.ChatUserStateRepository;
import com.chatapp.backend.repository.MessageRepository;
import com.chatapp.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chatapp/chats")
public class ChatController {
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final ChatUserStateRepository chatUserStateRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public ChatController(ChatRepository chatRepository, UserRepository userRepository,
                          MessageRepository messageRepository, ChatUserStateRepository chatUserStateRepository,
                          SimpMessagingTemplate simpMessagingTemplate) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.chatUserStateRepository = chatUserStateRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @GetMapping
    public List<Chat> getMyChats(@AuthenticationPrincipal Jwt jwt) {
        Long me = currentUserId(jwt);

        Set<Long> hiddenChatIds = chatUserStateRepository.findByUserIdAndHiddenTrue(me)
                .stream().map(ChatUserState::getChatId).collect(Collectors.toSet());

        List<Chat> result = new ArrayList<>(chatRepository.findChatsByUser(me).stream()
                .filter(c -> !hiddenChatIds.contains(c.getId()))
                .toList());

        List<Long> formerGroupIds = chatUserStateRepository
                .findByUserIdAndRemovedAtMessageIdIsNotNullAndHiddenFalse(me)
                .stream().map(ChatUserState::getChatId).toList();
        result.addAll(chatRepository.findAllById(formerGroupIds));

        return result;
    }

    @PostMapping("/createGroup")
    public Chat createGroupChat(@AuthenticationPrincipal Jwt jwt, @RequestBody CreateGroupDTO createReq) {
        User me = currentUser(jwt);

        if (createReq.getGroupName() == null || createReq.getGroupName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Group name is required");
        }

        Set<Long> participantIds = new HashSet<>();
        if (createReq.getParticipantIds() != null) {
            participantIds.addAll(createReq.getParticipantIds());
        }
        participantIds.add(me.getId());

        if (participantIds.size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A group must have at least 2 participants");
        }

        Set<User> participants = new HashSet<>(userRepository.findAllById(participantIds));

        if (participants.size() != participantIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more users do not exist");
        }

        Chat newChat = new Chat(createReq.getGroupName().trim(), "group");
        newChat.setParticipants(participants);
        newChat.getAdminIds().add(me.getId());

        Chat savedChat = chatRepository.save(newChat);
        for (User participant : savedChat.getParticipants()) {
            sendToUser(participant, "/queue/chats", savedChat);
        }

        return savedChat;
    }

    @PostMapping("/addParticipant")
    public Chat addParticipant(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long chatId,
            @RequestParam Long userId) {

        User me = currentUser(jwt);
        Chat chat = findChat(chatId);
        requireGroup(chat);
        requireAdmin(chat, me.getId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (isParticipant(chat, user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already a participant");
        }

        Long lastId = messageRepository.findMaxIdByChatId(chatId);

        chat.getParticipants().add(user);
        Chat savedChat = chatRepository.save(chat);

        ChatUserState state = getOrCreateState(chatId, user.getId());
        state.setClearedUpToMessageId(lastId != null ? lastId : 0L);
        state.setRemovedAtMessageId(null);
        state.setHidden(false);
        chatUserStateRepository.save(state);

        Message notice = saveSystemMessage(savedChat, me, me.getName() + " added " + user.getName());

        for (User p : savedChat.getParticipants()) {
            sendToUser(p, "/queue/chats", savedChat);
            sendToUser(p, "/queue/messages", notice);
        }
        return savedChat;
    }

    @DeleteMapping("/removeParticipant")
    public Chat removeParticipant(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long chatId,
            @RequestParam Long userId) {

        User me = currentUser(jwt);
        Chat chat = findChat(chatId);
        requireGroup(chat);
        requireAdmin(chat, me.getId());

        if (userId.equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot remove yourself");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!isParticipant(chat, user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a participant of this chat");
        }

        Message notice = saveSystemMessage(chat, me, me.getName() + " removed " + user.getName());
        return exitGroup(chat, user, notice);
    }

    @PostMapping("/{chatId}/leave")
    public Chat leaveGroup(@AuthenticationPrincipal Jwt jwt, @PathVariable Long chatId) {
        User me = currentUser(jwt);
        Chat chat = findChat(chatId);
        requireGroup(chat);
        requireParticipant(chat, me.getId());

        Message notice = saveSystemMessage(chat, me, me.getName() + " left the group");
        return exitGroup(chat, me, notice);
    }

    @PostMapping("/{chatId}/admins/{userId}")
    public Chat makeAdmin(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long chatId,
            @PathVariable Long userId) {

        Chat chat = findChat(chatId);
        requireGroup(chat);
        requireAdmin(chat, currentUserId(jwt));

        if (!isParticipant(chat, userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a participant of this chat");
        }

        chat.getAdminIds().add(userId);
        Chat savedChat = chatRepository.save(chat);
        for (User p : savedChat.getParticipants()) {
            sendToUser(p, "/queue/chats", savedChat);
        }
        return savedChat;
    }

    @PostMapping("/sendMessage")
    public Message sendMessage(@AuthenticationPrincipal Jwt jwt, @RequestBody SendMessageReqDTO messageReq) {

        Long chatId = messageReq.getChatId();
        Long receiverId = messageReq.getReceiverId();

        if ((receiverId == null && chatId == null) || (receiverId != null && chatId != null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide either receiverId or chatId");
        }
        if (messageReq.getContent() == null || messageReq.getContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message cannot be empty");
        }

        User sender = currentUser(jwt);

        Chat chat;

        if (chatId != null) {
            chat = findChat(chatId);
            requireParticipant(chat, sender.getId());
        } else {
            if (receiverId.equals(sender.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot message yourself");
            }

            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));

            chat = chatRepository.findChatBetweenUsers(sender.getId(), receiver.getId()).orElseGet(() -> {
                Chat newChat = new Chat();
                newChat.getParticipants().add(sender);
                newChat.getParticipants().add(receiver);
                return chatRepository.save(newChat);
            });
        }

        Message message = new Message();
        message.setContent(messageReq.getContent());
        message.setSender(sender);
        message.setChat(chat);
        Message savedMessage = messageRepository.save(message);

        List<ChatUserState> toUnhide = chatUserStateRepository.findByChatIdAndHiddenTrue(chat.getId())
                .stream().filter(s -> s.getRemovedAtMessageId() == null).toList();
        toUnhide.forEach(s -> s.setHidden(false));
        chatUserStateRepository.saveAll(toUnhide);

        for (User participant : chat.getParticipants()) {
            sendToUser(participant, "/queue/messages", savedMessage);
        }
        return savedMessage;
    }

    @GetMapping("/{chatId}/messages")
    public List<Message> getMessageList(@AuthenticationPrincipal Jwt jwt, @PathVariable Long chatId) {
        Long me = currentUserId(jwt);
        Chat chat = findChat(chatId);
        requireMemberOrFormer(chat, me);

        Optional<ChatUserState> state = chatUserStateRepository.findByChatIdAndUserId(chatId, me);
        Long cutoff = state.map(ChatUserState::getClearedUpToMessageId).orElse(0L);
        Long removedAt = state.map(ChatUserState::getRemovedAtMessageId).orElse(null);

        List<Message> messages = messageRepository.findByChat_IdAndIdGreaterThanOrderByIdAsc(chatId, cutoff);
        if (removedAt == null) {
            return messages;
        }
        return messages.stream().filter(m -> m.getId() <= removedAt).toList();
    }

    @DeleteMapping("/{chatId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteChat(@AuthenticationPrincipal Jwt jwt, @PathVariable Long chatId) {
        Long me = currentUserId(jwt);
        Chat chat = findChat(chatId);
        requireMemberOrFormer(chat, me);

        if ("group".equalsIgnoreCase(chat.getType()) && isParticipant(chat, me)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Groups can only be cleared, not deleted");
        }

        ChatUserState state = clearUpToLatest(chatId, me);
        state.setHidden(true);
        chatUserStateRepository.save(state);
    }

    @PostMapping("/{chatId}/clear")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearChat(@AuthenticationPrincipal Jwt jwt, @PathVariable Long chatId) {
        Long me = currentUserId(jwt);
        Chat chat = findChat(chatId);
        requireMemberOrFormer(chat, me);
        chatUserStateRepository.save(clearUpToLatest(chatId, me));
    }

    private Long currentUserId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }

    private User currentUser(Jwt jwt) {
        return userRepository.findById(currentUserId(jwt))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User no longer exists"));
    }

    private Chat findChat(Long chatId) {
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
    }

    private boolean isParticipant(Chat chat, Long userId) {
        return chat.getParticipants().stream().anyMatch(p -> p.getId().equals(userId));
    }

    private void requireParticipant(Chat chat, Long userId) {
        if (!isParticipant(chat, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant of this chat");
        }
    }

    private boolean isFormerMember(Long chatId, Long userId) {
        return chatUserStateRepository.findByChatIdAndUserId(chatId, userId)
                .map(s -> s.getRemovedAtMessageId() != null)
                .orElse(false);
    }

    private void requireMemberOrFormer(Chat chat, Long userId) {
        if (!isParticipant(chat, userId) && !isFormerMember(chat.getId(), userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant of this chat");
        }
    }

    private void requireGroup(Chat chat) {
        if (!"group".equalsIgnoreCase(chat.getType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This action is only allowed in groups");
        }
    }

    private void requireAdmin(Chat chat, Long userId) {
        if (!chat.getAdminIds().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only group admins can do this");
        }
    }

    private ChatUserState getOrCreateState(Long chatId, Long userId) {
        return chatUserStateRepository.findByChatIdAndUserId(chatId, userId)
                .orElseGet(() -> new ChatUserState(chatId, userId));
    }

    private ChatUserState clearUpToLatest(Long chatId, Long userId) {
        Long lastId = messageRepository.findMaxIdByChatId(chatId);
        ChatUserState state = getOrCreateState(chatId, userId);
        state.setClearedUpToMessageId(lastId != null ? lastId : 0L);
        return state;
    }

    private Chat exitGroup(Chat chat, User user, Message notice) {
        ChatUserState state = getOrCreateState(chat.getId(), user.getId());
        state.setRemovedAtMessageId(notice.getId());
        state.setHidden(false);
        chatUserStateRepository.save(state);

        chat.getParticipants().removeIf(p -> p.getId().equals(user.getId()));
        chat.getAdminIds().remove(user.getId());

        if (chat.getAdminIds().isEmpty() && !chat.getParticipants().isEmpty()) {
            chat.getParticipants().stream()
                    .map(User::getId)
                    .min(Long::compare)
                    .ifPresent(id -> chat.getAdminIds().add(id));
        }

        Chat savedChat = chatRepository.save(chat);

        List<User> recipients = new ArrayList<>(savedChat.getParticipants());
        recipients.add(user);
        for (User p : recipients) {
            sendToUser(p, "/queue/chats", savedChat);
            sendToUser(p, "/queue/messages", notice);
        }
        return savedChat;
    }

    private Message saveSystemMessage(Chat chat, User actor, String text) {
        Message m = new Message();
        m.setType("SYSTEM");
        m.setContent(text);
        m.setSender(actor);
        m.setChat(chat);
        return messageRepository.save(m);
    }

    private void sendToUser(User user, String destination, Object payload) {
        simpMessagingTemplate.convertAndSendToUser(user.getId().toString(), destination, payload);
    }
}
