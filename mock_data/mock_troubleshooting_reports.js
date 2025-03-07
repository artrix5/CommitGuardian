const mockTroubleshootingReports = {
    "image-processor": [
        {
            id: "TR-2025-011",
            title: "Incomplete image format validation",
            status: "Resolved",
            severity: "Medium",
            dateSubmitted: "2025-04-07",
            description: "Customer reported that the image processor crashes when processing unsupported formats. Fixed by adding validation for supported image formats and proper error handling.",
            relatedCommits: ["e1f2g3h4i"]
        },
        {
            id: "TR-2025-012",
            title: "Lack of file size validation",
            status: "Open",
            severity: "High",
            dateSubmitted: "2025-04-08",
            description: "Security audit flagged that the image processor does not validate file size, potentially allowing DoS attacks via extremely large images. Planning to add file size validation.",
            relatedCommits: ["e1f2g3h4i"]
        }
    ],
    "auth-service": [
        {
            id: "TR-2025-013",
            title: "Plain text password storage",
            status: "Resolved",
            severity: "Critical",
            dateSubmitted: "2025-04-08",
            description: "Security audit flagged that passwords are stored in plain text. Fixed by implementing password hashing using BCrypt.",
            relatedCommits: ["j5k6l7m8n"]
        },
        {
            id: "TR-2025-014",
            title: "Lack of rate limiting for authentication attempts",
            status: "Open",
            severity: "High",
            dateSubmitted: "2025-04-09",
            description: "Security audit flagged that the authentication service does not implement rate limiting, making it vulnerable to brute force attacks. Planning to add rate limiting.",
            relatedCommits: ["j5k6l7m8n"]
        }
    ],
    "message-queue": [
        {
            id: "TR-2025-015",
            title: "Unencrypted sensitive messages",
            status: "Resolved",
            severity: "Critical",
            dateSubmitted: "2025-04-09",
            description: "Customer reported that sensitive messages are transmitted without encryption. Fixed by implementing AES encryption for all sensitive messages.",
            relatedCommits: ["o9p0q1r2s"]
        },
        {
            id: "TR-2025-016",
            title: "Lack of key rotation for encryption",
            status: "Open",
            severity: "High",
            dateSubmitted: "2025-04-10",
            description: "Security audit flagged that encryption keys are not rotated, posing a long-term security risk. Planning to implement key rotation logic.",
            relatedCommits: ["o9p0q1r2s"]
        }
    ],
    "data-analytics": [
        {
            id: "TR-2025-017",
            title: "SQL injection vulnerability in query parameters",
            status: "Resolved",
            severity: "Critical",
            dateSubmitted: "2025-04-10",
            description: "Security audit flagged that query parameters are not properly sanitized, making the system vulnerable to SQL injection. Fixed by implementing parameterized queries.",
            relatedCommits: ["t3u4v5w6x"]
        },
        {
            id: "TR-2025-018",
            title: "Lack of logging for invalid query attempts",
            status: "Open",
            severity: "Medium",
            dateSubmitted: "2025-04-11",
            description: "Security audit flagged that invalid query attempts are not logged, making it difficult to detect and respond to potential attacks. Planning to add logging for invalid queries.",
            relatedCommits: ["t3u4v5w6x"]
        }
    ],
    "payment-gateway": [
        {
            id: "TR-2025-019",
            title: "Raw credit card data storage",
            status: "Resolved",
            severity: "Critical",
            dateSubmitted: "2025-04-11",
            description: "Security audit flagged that raw credit card data is stored in the database. Fixed by implementing secure tokenization for credit card data.",
            relatedCommits: ["y7z8a9b0c"]
        },
        {
            id: "TR-2025-020",
            title: "Lack of PCI DSS compliance checks",
            status: "Open",
            severity: "High",
            dateSubmitted: "2025-04-12",
            description: "Security audit flagged that the payment gateway does not fully comply with PCI DSS standards. Planning to implement additional compliance checks.",
            relatedCommits: ["y7z8a9b0c"]
        }
    ],
    "iot-controller": [
        {
            id: "TR-2025-021",
            title: "Unauthorized firmware updates",
            status: "Resolved",
            severity: "Critical",
            dateSubmitted: "2025-04-12",
            description: "Customer reported that unauthorized firmware updates can be installed. Fixed by implementing firmware signature verification.",
            relatedCommits: ["d1e2f3g4h"]
        },
        {
            id: "TR-2025-022",
            title: "Lack of rollback mechanism for failed updates",
            status: "Open",
            severity: "High",
            dateSubmitted: "2025-04-13",
            description: "Customer reported that failed firmware updates can leave devices in an unstable state. Planning to implement a rollback mechanism for failed updates.",
            relatedCommits: ["d1e2f3g4h"]
        }
    ]
};

export default mockTroubleshootingReports;