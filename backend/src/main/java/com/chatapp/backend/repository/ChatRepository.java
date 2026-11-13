package com.chatapp.backend.repository;

import com.chatapp.backend.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat,Long> {
//    @Query("""
//        SELECT c FROM Chat c
//        WHERE c.participant1.id = :userId
//           OR c.participant2.id = :userId
//    """)
//    List<Chat> findChatsByUser(@Param("userId") Long userId);

     @Query("""
        SELECT c FROM Chat c
        JOIN c.participants p
        WHERE p.id = :userId
     """)

    List<Chat> findChatsByUser(Long userId);

//    @Query("""
//    SELECT c FROM Chat c
//    WHERE (c.participant1.id = :user1Id AND c.participant2.id = :user2Id)
//       OR (c.participant1.id = :user2Id AND c.participant2.id = :user1Id)
//""")
//    Optional<Chat> findChatBetweenUsers(
//            @Param("user1Id") Long user1Id,
//            @Param("user2Id") Long user2Id
//    );

    @Query("""
    SELECT c
    FROM Chat c
    JOIN c.participants p
    WHERE c.type IS NULL OR c.type <> 'group'
    GROUP BY c
    HAVING COUNT(p) = 2
       AND COUNT(CASE WHEN p.id IN (:user1Id, :user2Id) THEN 1 END) = 2
""")
    Optional<Chat> findChatBetweenUsers(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id
    );

}