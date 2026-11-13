Toodles: Real-Time Chat Application | Java, Spring     
  Boot, Next.js, MySQL, WebSockets, Docker, Azure        
  Live:                                                  
  https://toodles-chat.centralindia.cloudapp.azure.com   
                                                         
  - Built a full-stack real-time messaging app with      
    one-to-one and group chats, using Spring Boot 4      
    (Java 21), Next.js 16 / React 19 and MySQL. Messages 
    are delivered instantly over WebSockets (STOMP) to   
    per-user private queues.                             
  - Implemented stateless JWT authentication with Spring 
    Security (OAuth2 resource server). Tokens are stored 
    in httpOnly, SameSite cookies, passwords are hashed  
    with BCrypt, and WebSocket connections are authorized
    by a custom STOMP interceptor.                       
  - Designed WhatsApp-style "delete for me" and "clear   
    chat" using a per-user chat-state model with         
    message-ID cutoffs. One user's history is hidden     
    without affecting other participants, and a deleted  
    chat reappears when new activity arrives.            
  - Built group administration: admin roles, add/remove  
    participants, leaving a group, and automatic admin   
    promotion. System notices are broadcast to members.  
    New members can't see earlier history, and removed   
    members keep read-only access up to their removal.   
  - Added centralized error handling                     
    (@RestControllerAdvice plus JSON security error      
    handlers) with a consistent error format, shown in   
    the UI through React Query and toast notifications.  
  - Containerized the app with multi-stage Docker builds 
    and Docker Compose (MySQL, backend, frontend, Caddy  
    reverse proxy). Deployed it to an Azure VM with      
    automatic HTTPS (Let's Encrypt) and environment-based
    secrets.
