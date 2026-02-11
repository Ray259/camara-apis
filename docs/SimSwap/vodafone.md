Steps to call these APIs
Register an account on https://developer.vodafone.com and create a sandbox app for the APIs that you are interested in.
Use the Client Key and Secret from your sandbox app to populate the relating variables in the "Sandbox Credentials" environment group in Postman.
These API use a three-legged OAuth flow. A three-legged OAuth process involves three parties: the end-user (or resource owner), the client (the third-party application), and the server (or authorization server).
First call the authorize endpoint to get an authorization code. Your client credentials will be taken from the environment variables.
You need to call the authorize end-point for each Identity API in the CAMARA portfolio as the product scope is set in the request body of the authorize call.
Call the token endpoint to exchange the authorization code for a bearer token that is used in the API resource endpoint.
The last bearer token and trace ID will be stored in collection variables associated with the API solution that you have chosen.
You can use these collections as read-only or create a fork into your own personal workspace to edit the details.


POST
Authorization request
https://{{VF_SANDBOX_URL}}/openIDConnectCIBA/v1/bc-authorize
3 legged authorization request.




POST
Authorization request
https://{{VF_SANDBOX_URL}}/openIDConnectCIBA/v1/bc-authorize
3 legged authorization request.

Authorization
Basic Auth
Username
{{SANDBOX_CLIENT_KEY}}
Password
{{SANDBOX_CLIENT_SECRET}}
Body
urlencoded
login_hint
tel:+447123456789
scope
openid retrieve-sim-swap-date
x-correlator
Value to track and correlate requests across multipe requests.

Example
Authorization request
Request
Postman CLI
postman request POST 'https://{{VF_SANDBOX_URL}}/openIDConnectCIBA/v1/bc-authorize' \
  --header 'vf-trace-transaction-id: 6e77066d-ad69-4dcf-a2d8-8143886da3a4' \
  --header 'accept: application/json' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --body ''

  Response
Body
json
{
    "auth_req_id": "<<code-here>>",
    "expires_in": 300,
    "interval": 0
}

Headers (33)
Date
Tue, 08 Oct 2024 12:42:24 GMT
Content-Type
application/json
Transfer-Encoding
chunked
Connection
keep-alive
matched-stub-id
cdca0941-5bef-4b27-9393-f1603a2342ab
Content-Encoding
gzip
Cache-Control
no-cache
strict-transport-security
max-age=15768000; includeSubDomains
x-rate-limit-limit
1000
x-rate-limit-remaining
999
x-rate-limit-reset
0
vf-transaction-id
b694478c-aa39-49c6-9e99-ecf78c9c3f64
x-xss-protection
1; mode=block
content-security-policy
default-src 'none'; frame-ancestors 'none'; form-action 'none'; sandbox
x-frame-options
SAMEORIGIN
x-content-type-options
nosniff;
pragma
no-cache
referrer-policy
no-referrer
x-permitted-cross-domain-policies
none
cross-origin-embedder-policy
require-corp
cross-origin-opener-policy
same-origin
cross-origin-resource-policy
same-site
access-control-allow-headers
*
access-control-expose-headers
X-Correlator,vf-trace-transaction-id,vf_ext_bp_id,X-Total-Count,X-Result-Count
access-control-max-age
31536
access-control-allow-methods
GET, PUT, POST, PATCH
x-correlator
b694478c-aa39-49c6-9e99-ecf78c9c3f64
vf-trace-transaction-id
b694478c-aa39-49c6-9e99-ecf78c9c3f64
x-request-id
a060c179-9cad-4210-b0c0-9a7727bf73d5
via
1.1 google
CF-Cache-Status
DYNAMIC
Server
cloudflare
CF-RAY
8cf635edada92dd9-MAN


POST
SIM Swap - token
https://{{VF_SANDBOX_URL}}/openIDConnectCIBA/v1/token
Get auth token request.

Authorization
Basic Auth
Username
{{SANDBOX_CLIENT_KEY}}
Password
{{SANDBOX_CLIENT_SECRET}}
Body
urlencoded
auth_req_id
Same value as the one passed on the Authorization Request

grant_type
urn:openid:params:grant-type:ciba
content-type
application/x-www-form-urlencoded
Example
SIM Swap - token
Request
Postman CLI
postman request POST 'https://{{VF_SANDBOX_URL}}/openIDConnectCIBA/v1/token' \
  --header 'vf-trace-transaction-id: ' \
  --header 'accept: application/json' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --body ''


  Response
Body
json
{
    "access_token": "<<access-token-here>>",
    "token_type": "Bearer",
    "expires_in": 3597,
    "id_token": "<<id-token-here>>"
}

Headers (33)
Date
Tue, 08 Oct 2024 12:42:58 GMT
Content-Type
application/json
Transfer-Encoding
chunked
Connection
keep-alive
matched-stub-id
0c9bebf0-a036-45c9-aeb3-74432deb13bc
Content-Encoding
gzip
Cache-Control
no-cache
strict-transport-security
max-age=15768000; includeSubDomains
x-rate-limit-limit
1000
x-rate-limit-remaining
999
x-rate-limit-reset
0
vf-transaction-id
7462b7db-2a88-4bc6-a23a-fbaa2de254d0
x-xss-protection
1; mode=block
content-security-policy
default-src 'none'; frame-ancestors 'none'; form-action 'none'; sandbox
x-frame-options
SAMEORIGIN
x-content-type-options
nosniff;
pragma
no-cache
referrer-policy
no-referrer
x-permitted-cross-domain-policies
none
cross-origin-embedder-policy
require-corp
cross-origin-opener-policy
same-origin
cross-origin-resource-policy
same-site
access-control-allow-headers
*
access-control-expose-headers
X-Correlator,vf-trace-transaction-id,vf_ext_bp_id,X-Total-Count,X-Result-Count
access-control-max-age
31536
access-control-allow-methods
GET, PUT, POST, PATCH
x-correlator
7462b7db-2a88-4bc6-a23a-fbaa2de254d0
vf-trace-transaction-id
7462b7db-2a88-4bc6-a23a-fbaa2de254d0
x-request-id
fb7e1019-8ae4-41ae-8f80-d28dc30f78da
via
1.1 google
CF-Cache-Status
DYNAMIC
Server
cloudflare
CF-RAY
8cf636c1dcee2dd9-MAN


POST
SIM Swap - retrieve-date
https://{{VF_SANDBOX_URL}}/sim-swap/v1/retrieve-date

Authorization
Bearer Token
Token
Body
raw (json)
json
{}
Example
SIM SWap - /retrieve-date
Request
Postman CLI
postman request POST 'https://{{VF_SANDBOX_URL}}/sim-swap/v1/retrieve-date' \
  --header 'vf_ext_bp_id: Acme_Co' \
  --header 'Accept: application/json' \
  --body '{}'