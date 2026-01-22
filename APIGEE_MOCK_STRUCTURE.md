Apigee Edge Management API - Mock Server Reference
Base URL Pattern: https://api.enterprise.apigee.com/v1 (SaaS) or http://<ms-ip>:8080/v1 (Private Cloud) Base Organization Path: /v1/organizations/{org} Date Format: Epoch Timestamp (Long)

1. Organizations
List Organizations
Endpoint: GET /v1/organizations

Response Structure: Array of strings (Org IDs).

JSON

[
  "my-org-1",
  "my-org-2"
]
Get Organization Details
Endpoint: GET /v1/organizations/{org}

Response Structure:

JSON

{
  "name": "my-org-1",
  "displayName": "My Organization",
  "type": "paid", // "trial" or "paid"
  "createdAt": 1672531200000,
  "createdBy": "admin@example.com",
  "lastModifiedAt": 1672531200000,
  "lastModifiedBy": "admin@example.com",
  "environments": [
    "test",
    "prod"
  ],
  "properties": {
    "property": [
      {
        "name": "features.isCpsEnabled",
        "value": "true"
      }
    ]
  }
}
2. Environments
List Environments
Endpoint: GET /v1/organizations/{org}/environments

Response Structure: Array of strings.

JSON

[
  "test",
  "prod"
]
Get Environment Details
Endpoint: GET /v1/organizations/{org}/environments/{env}

Response Structure:

JSON

{
  "name": "test",
  "createdAt": 1672531200000,
  "createdBy": "ops@example.com",
  "lastModifiedAt": 1672531200000,
  "lastModifiedBy": "ops@example.com",
  "properties": {
    "property": [
      {
        "name": "enable.analytics",
        "value": "true"
      }
    ]
  }
}
3. API Proxies
List All Proxies
Endpoint: GET /v1/organizations/{org}/apis

Response Structure: Array of strings.

JSON

[
  "customer-api-v1",
  "inventory-api-v1"
]
Get Single Proxy Details
Endpoint: GET /v1/organizations/{org}/apis/{apiName}

Response Structure:

JSON

{
  "name": "customer-api-v1",
  "revision": [
    "1",
    "2",
    "3"
  ],
  "metaData": {
    "createdAt": 1672531200000,
    "createdBy": "dev@example.com",
    "lastModifiedAt": 1675123200000,
    "lastModifiedBy": "dev@example.com"
  },
  "type": "Application" // Always "Application" for standard proxies
}
Get Deployment Status (Critical for Dashboard)
Endpoint: GET /v1/organizations/{org}/apis/{apiName}/deployments

Response Structure:

JSON

{
  "environment": [
    {
      "name": "test",
      "revision": [
        {
          "name": "3", // The revision number currently running
          "state": "deployed", // "deployed" or "error"
          "server": [
            {
              "status": "deployed",
              "type": "message-processor",
              "uUID": "942629d8-90fa-40c6-a67b-111111111111"
            },
            {
              "status": "deployed",
              "type": "message-processor",
              "uUID": "942629d8-90fa-40c6-a67b-222222222222"
            }
          ]
        }
      ]
    }
  ],
  "name": "customer-api-v1",
  "organization": "my-org-1"
}
4. API Products
List All Products (Expanded)
Endpoint: GET /v1/organizations/{org}/apiproducts?expand=true

Response Structure: Object containing list of products.

JSON

{
  "apiProduct": [
    {
      "name": "Gold-Product",
      "displayName": "Gold Tier API Access",
      "description": "Premium access to all APIs",
      "approvalType": "manual", // "auto" or "manual"
      "attributes": [
        {
          "name": "access",
          "value": "public"
        }
      ],
      "environments": [
        "test",
        "prod"
      ],
      "proxies": [
        "customer-api-v1",
        "inventory-api-v1"
      ],
      "quota": "10000",
      "quotaInterval": "1",
      "quotaTimeUnit": "month",
      "scopes": [
        "read",
        "write"
      ],
      "createdAt": 1672531200000,
      "lastModifiedAt": 1672531200000
    }
  ]
}
Get Single Product
Endpoint: GET /v1/organizations/{org}/apiproducts/{productName}

Response Structure: Same as a single object from the apiProduct array above.

5. Apps (Developer Apps)
List All Apps (Expanded)
Endpoint: GET /v1/organizations/{org}/apps?expand=true

Response Structure: Object containing list of apps.

JSON

{
  "app": [
    {
      "appId": "093485-304985-349085",
      "name": "MyPartnerApp",
      "accessType": "read",
      "appFamily": "default",
      "callbackUrl": "https://partner.com/callback",
      "developerId": "dev-uuid-1234",
      "status": "approved", // "approved" or "revoked"
      "credentials": [
        {
          "consumerKey": "client_id_example_123",
          "consumerSecret": "client_secret_example_456",
          "expiresAt": -1,
          "issuedAt": 1672531200000,
          "status": "approved",
          "apiProducts": [
            {
              "apiproduct": "Gold-Product",
              "status": "approved"
            }
          ]
        }
      ],
      "createdAt": 1672531200000,
      "createdBy": "partner@example.com",
      "lastModifiedAt": 1672531200000,
      "lastModifiedBy": "admin@example.com"
    }
  ]
}
Get Single App
Endpoint: GET /v1/organizations/{org}/apps/{appName}

Response Structure: Same as a single object from the app array above.

6. Target Servers
List All Target Servers
Endpoint: GET /v1/organizations/{org}/environments/{env}/targetservers

Response Structure: Array of strings.

JSON

[
  "backend-payments",
  "backend-legacy"
]
Get Single Target Server
Endpoint: GET /v1/organizations/{org}/environments/{env}/targetservers/{targetName}

Response Structure:

JSON

{
  "name": "backend-payments",
  "host": "api.backend.internal",
  "port": 443,
  "isEnabled": true,
  "sSLInfo": {
    "enabled": true,
    "clientAuthEnabled": true,
    "keyStore": "ref://my-keystore-ref",
    "keyAlias": "my-client-cert",
    "trustStore": "ref://my-truststore-ref",
    "ignoreValidationErrors": false,
    "ciphers": [],
    "protocols": []
  }
}
7. Key Value Maps (KVMs)
List All KVMs (Environment Scoped)
Endpoint: GET /v1/organizations/{org}/environments/{env}/keyvaluemaps

Response Structure: Array of strings.

JSON

[
  "config-settings",
  "feature-flags"
]
Get Single KVM
Endpoint: GET /v1/organizations/{org}/environments/{env}/keyvaluemaps/{kvmName}

Response Structure:

JSON

{
  "name": "config-settings",
  "encrypted": true,
  "entry": [
    {
      "name": "backend_timeout",
      "value": "5000"
    },
    {
      "name": "retry_count",
      "value": "3"
    }
  ]
}
8. Caches
List All Caches
Endpoint: GET /v1/organizations/{org}/environments/{env}/caches

Response Structure: Array of strings.

JSON

[
  "response-cache",
  "token-cache"
]
Get Single Cache
Endpoint: GET /v1/organizations/{org}/environments/{env}/caches/{cacheName}

Response Structure:

JSON

{
  "name": "response-cache",
  "description": "Cache for API responses",
  "expirySettings": {
    "timeoutInSec": {
      "value": "300"
    },
    "valuesNull": false
  },
  "overflowToDisk": false,
  "skipCacheIfElementSizeInKBExceeds": "512",
  "distributed": true,
  "compression": {
    "minimumSizeInKB": 0
  }
}
9. Keystores & Truststores
List All Keystores
Endpoint: GET /v1/organizations/{org}/environments/{env}/keystores

Response Structure: Array of strings.

JSON

[
  "my-keystore",
  "my-truststore"
]
Get Single Keystore Details
Endpoint: GET /v1/organizations/{org}/environments/{env}/keystores/{keystoreName}

Response Structure:

JSON

{
  "name": "my-keystore",
  "aliases": [
    "server-cert",
    "client-cert"
  ],
  "certs": [
    "server-cert",
    "client-cert"
  ]
}
Get Certificate Details (Alias) - Crucial for Expiry
Endpoint: GET /v1/organizations/{org}/environments/{env}/keystores/{keystoreName}/aliases/{aliasName}

Response Structure:

JSON

{
  "alias": "server-cert",
  "type": "keycert", // "keycert" (private key + cert) or "cert" (cert only)
  "format": "pem",
  "certificate": "-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJ...\n-----END CERTIFICATE-----"
}
Note: The API returns the raw PEM string. The UI/Dashboard is responsible for parsing this string to display the Expiration Date.

10. References
List All References
Endpoint: GET /v1/organizations/{org}/environments/{env}/references

Response Structure: Array of strings.

JSON

[
  "my-keystore-ref",
  "my-truststore-ref"
]
Get Single Reference
Endpoint: GET /v1/organizations/{org}/environments/{env}/references/{refName}

Response Structure:

JSON

{
  "name": "my-keystore-ref",
  "refers": "my-keystore",
  "resourceType": "KeyStore"
}
11. Virtual Hosts
List All Virtual Hosts
Endpoint: GET /v1/organizations/{org}/environments/{env}/virtualhosts

Response Structure: Array of strings.

JSON

[
  "default",
  "secure"
]
Get Single Virtual Host
Endpoint: GET /v1/organizations/{org}/environments/{env}/virtualhosts/{vhName}

Response Structure:

JSON

{
  "name": "secure",
  "hostAliases": [
    "api.example.com"
  ],
  "interfaces": [],
  "port": "443",
  "baseUrl": "https://api.example.com",
  "sSLInfo": {
    "enabled": true,
    "keyStore": "ref://my-keystore-ref",
    "keyAlias": "server-cert",
    "trustStore": "ref://my-truststore-ref",
    "clientAuthEnabled": false
  },
  "properties": {
      "property": [
          {
              "name": "keepalive.timeout.millis",
              "value": "300000"
          }
      ]
  }
}