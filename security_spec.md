# NaijaFlavors Security Specification

## Data Invariants
1. A user can only see their own private profile data (PII).
2. Recipes are public for reading, but only premium users or admins can access specific premium recipe details (logic handled in app, but rules protect the data). Actually, for simplicity, recipes are readable by all if non-premium, premium check needed if premium.
3. Users can only update their own `savedRecipes` and basic profile info. They cannot change their `role` or `isPremium` status.
4. Transactions are only readable by the owner or admin. They are only createable by the system (or validated by user creating it with system-expected ref).
5. Admins have full access to manage recipes.

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Spoofing**: User A attempts to update User B's `savedRecipes`. (DENIED)
2. **Privilege Escalation**: User attempts to set `role: "admin"` on their own profile. (DENIED)
3. **Payload Poisoning**: Creating a recipe with a 1MB string for `title`. (DENIED)
4. **Invalid State**: Updating a transaction status from "success" to "pending". (DENIED)
5. **ID Injection**: Using a 500-character junk string as a document ID. (DENIED)
6. **Orphaned Writes**: Creating a transaction for a non-existent user. (DENIED)
7. **Timestamp Fraud**: Setting `createdAt` to a date in 2030. (DENIED)
8. **Shadow Field**: Adding `isHacked: true` to a recipe document. (DENIED)
9. **Unverified Auth**: Attempting to write data with an unverified email (assuming verification required). (DENIED)
10. **Admin Bypass**: Attempting to delete a recipe as a normal user. (DENIED)
11. **Premium Theft**: User A attempts to set `isPremium: true` without a valid transaction. (DENIED)
12. **Blanket Read Scam**: Trying to list all transactions path without a userId filter. (DENIED)
