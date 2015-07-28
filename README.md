# nodejstut
Verb:         POST
Path:         /api/authenticate
Params:
email: text
password: text
Response:
token:string
user_id:int

Verb:         GET
Path:         /api/users
Headers:
Token:string
Response:
users[]

Verb:         POST
Path:         /api/users
Headers:
Token:string
Body-Params:
username:text
password:text
Response:
user created

Verb:         GET
Path:         /api/messages
Headers:
Token:string
Response:
messages[]

Verb:         POST
Path:         /api/messages
Headers:
Token:string
body-param:
descr:text
Response:
Message sent
