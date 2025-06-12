-- Firestore Security Rules
-- Copy these rules to your Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read and write their own game data
    match /gameData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read and write their own user stats
    match /userStats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read and write their own game sessions
    match /gameSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || request.auth.uid == request.resource.data.userId);
    }
    
    // Allow users to query their own sessions
    match /gameSessions/{sessionId} {
      allow list: if request.auth != null && 
        request.query.where('userId', '==', request.auth.uid);
    }
  }
}
