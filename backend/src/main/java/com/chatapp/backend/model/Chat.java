package com.chatapp.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true)
    private String name;
    private String type;

//    @ManyToOne
//    @JoinColumn(name="participant1_id")
//    private User participant1;
//
//    @ManyToOne
//    @JoinColumn(name="participant2_id")
//    private User participant2;

    @OneToMany(mappedBy = "chat",cascade = CascadeType.ALL,orphanRemoval = true)
    @JsonIgnore
    private List<Message> messages = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "chat_participants",
            joinColumns = @JoinColumn(name="chat_id"),
            inverseJoinColumns = @JoinColumn(name="user_id")
    )
    private Set<User> participants = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "chat_admins", joinColumns = @JoinColumn(name = "chat_id"))
    @Column(name = "user_id")
    private Set<Long> adminIds = new HashSet<>();

    public Chat(){
    }

    public Chat( String name, String type) {
        this.name = name;
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Message> getMessages() {
        return messages;
    }

    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }

    public Set<User> getParticipants() {
        return participants;
    }

    public void setParticipants(Set<User> participants) {
        this.participants = participants;
    }

    public Set<Long> getAdminIds() {
        return adminIds;
    }

    public void setAdminIds(Set<Long> adminIds) {
        this.adminIds = adminIds;
    }
}
