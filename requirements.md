Project Requirements Document
=====

Definitions
-----

- User
- Message
- Channel: what describes a rule of populating messages
- Channel instance: what populates messages

User-end
-----

### Account

#### Login

##### allow user to login with email& password

Input

- email
- password

Result

- login success
- user not exist
- password mismatch
- account disabled

##### allow user to reset password with email

Input

- email

Output

- send an email to the address
- user not exist

Input

- email link
- new password

Output

- success
- invalid link

#### Register

##### allow user to register with email& password

#### Delete account

##### allow user to delete account

Input

- email
- password

Output

- success
- failure

### Message

#### View messages

##### allow user to view messages list

Input

- count limit (optional)
- start from (optional)
- limit to unread/readed/all ones (defaults to all)

Output

- array of message (see below)

##### allow user to mark message(s) as read

Input

- message id(s)

Output

- success
- failure

##### allow user to view a single message

Input

- message id

Output

- message id
- source channel
- title
- content
- (if any) attachments
- posted at
- fetched at
- automatically mark message as read

### Channel

#### View Channels

##### allow user to discover channels

Input

Output

- list of channels

Channel

- channel id
- title
- description
- configurable sets

#### Add channel instance

##### allow user to add a channel instance

Input

- channel id
- configurations (provide user with a configuration hint)

Output

- channel instance id

#### View channel instance

##### allow user to view a channel instance

Input

- channel id

Output

- channel instance id
- last executed
- messages populated

#### Modify channel instance

##### allow user to update a channel instance

Input

- channel id
- configuration

Output

- success
- failure

##### allow user to delete a channel instance

Input

- channel instance id

Output

- success
- failure

Note

- do not delete messages