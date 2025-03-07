const mockComments = {
    "e1f2g3h4i": [ // Image compression functionality
        {
            id: "comment-201",
            author: "Grace Lee",
            authorInitials: "GL",
            timestamp: "2025-03-07T15:22:33Z",
            content: "The current compression algorithm seems inefficient for high-resolution images. We should benchmark different compression libraries.",
            file: "ImageCompressor.py",
            line: 12,
            status: "unresolved",
            replies: [
                {
                    id: "comment-202",
                    author: "Grace Lee",
                    authorInitials: "GL",
                    timestamp: "2025-03-07T16:45:21Z",
                    content: "I'll run performance tests on different compression libraries to optimize our implementation.",
                    status: "resolved"
                }
            ]
        },
        {
            id: "comment-203",
            author: "Grace Lee",
            authorInitials: "GL",
            timestamp: "2025-03-07T17:10:55Z",
            content: "Quality preservation is crucial. We should add a configurable quality parameter.",
            file: "ImageCompressor.py",
            line: 25,
            status: "resolved",
            replies: []
        }
    ],
    "t3u4v5w6x": [ // Input validation 
        {
            id: "comment-212",
            author: "Jack Wilson",
            authorInitials: "JW",
            timestamp: "2025-03-10T11:15:33Z",
            content: "Current input validation seems superficial. We need more comprehensive checks.",
            file: "QueryProcessor.py",
            line: 18,
            status: "unresolved",
            replies: [
                {
                    id: "comment-213",
                    author: "Jack Wilson",
                    authorInitials: "JW",
                    timestamp: "2025-03-10T12:30:45Z",
                    content: "I'll implement regex-based validation and add type casting checks.",
                    status: "resolved"
                }
            ]
        },
        {
            id: "comment-214",
            author: "Jack Wilson",
            authorInitials: "JW",
            timestamp: "2025-03-10T13:45:21Z",
            content: "Consider adding sanitization for SQL injection prevention.",
            file: "QueryProcessor.py",
            line: 35,
            status: "resolved",
            replies: []
        }
    ],
    "j5k6l7m8n": [ // Password hashing authentication
        {
            id: "comment-204",
            author: "Henry Brown",
            authorInitials: "HB",
            timestamp: "2025-03-08T10:15:42Z",
            content: "We need to implement a more robust password hashing strategy. Current method might be vulnerable to rainbow table attacks.",
            file: "AuthService.java",
            line: 15,
            status: "unresolved",
            replies: [
                {
                    id: "comment-205",
                    author: "Henry Brown",
                    authorInitials: "HB",
                    timestamp: "2025-03-08T11:30:18Z",
                    content: "I'll upgrade to Argon2 with adaptive parameters.",
                    status: "resolved"
                }
            ]
        },
        {
            id: "comment-206",
            author: "Henry Brown",
            authorInitials: "HB",
            timestamp: "2025-03-08T12:05:33Z",
            content: "Consider adding multi-factor authentication for critical endpoints.",
            file: "AuthService.java",
            line: 30,
            status: "resolved",
            replies: []
        },
        {
            id: "comment-207",
            author: "Henry Brown",
            authorInitials: "HB",
            timestamp: "2025-03-08T13:15:44Z",
            content: "Logging authentication attempts could help with security monitoring.",
            file: "AuthService.java",
            line: 45,
            status: "unresolved",
            replies: [
                {
                    id: "comment-208",
                    author: "Henry Brown",
                    authorInitials: "HB",
                    timestamp: "2025-03-08T14:22:11Z",
                    content: "I'll implement structured logging with masked sensitive information.",
                    status: "resolved"
                }
            ]
        }
    ],
    "y7z8a9b0c": [ // Credit card tokenization
        {
            id: "comment-215",
            author: "Karen Davis",
            authorInitials: "KD",
            timestamp: "2025-03-11T14:22:11Z",
            content: "Our current tokenization doesn't handle international card formats. Need to expand validation.",
            file: "TokenizationService.java",
            line: 22,
            status: "unresolved",
            replies: [
                {
                    id: "comment-216",
                    author: "Karen Davis",
                    authorInitials: "KD",
                    timestamp: "2025-03-11T15:33:44Z",
                    content: "I'll add support for IBAN and other international formats.",
                    status: "resolved"
                }
            ]
        },
        {
            id: "comment-217",
            author: "Karen Davis",
            authorInitials: "KD",
            timestamp: "2025-03-11T16:10:33Z",
            content: "We should implement compliance checks for different payment regulations.",
            file: "TokenizationService.java",
            line: 40,
            status: "resolved",
            replies: []
        }
    ],
    "o9p0q1r2s": [ // Message encryption
        {
            id: "comment-209",
            author: "Ivy Chen",
            authorInitials: "IC",
            timestamp: "2025-03-09T22:33:21Z",
            content: "The current encryption seems basic. We should consider implementing forward secrecy.",
            file: "EncryptionUtils.cpp",
            line: 20,
            status: "unresolved",
            replies: [
                {
                    id: "comment-210",
                    author: "Ivy Chen",
                    authorInitials: "IC",
                    timestamp: "2025-03-09T23:45:12Z",
                    content: "I'll implement an Elliptic Curve Diffie-Hellman key exchange.",
                    status: "resolved"
                }
            ]
        },
        {
            id: "comment-211",
            author: "Ivy Chen",
            authorInitials: "IC",
            timestamp: "2025-03-10T00:22:44Z",
            content: "We should add periodic key rotation to enhance security.",
            file: "EncryptionUtils.cpp",
            line: 35,
            status: "resolved",
            replies: []
        }
    ],
    "d1e2f3g4h": [ // Firmware update verification
        {
            id: "comment-218",
            author: "Liam Johnson",
            authorInitials: "LJ",
            timestamp: "2025-03-12T03:45:22Z",
            content: "Current firmware verification lacks cryptographic signature checks.",
            file: "FirmwareUpdater.erl",
            line: 15,
            status: "unresolved",
            replies: [
                {
                    id: "comment-219",
                    author: "Liam Johnson",
                    authorInitials: "LJ",
                    timestamp: "2025-03-12T04:11:33Z",
                    content: "I'll add Ed25519 signature verification with manufacturer's public key.",
                    status: "resolved"
                }
            ]
        },
        {
            id: "comment-220",
            author: "Liam Johnson",
            authorInitials: "LJ",
            timestamp: "2025-03-12T05:22:44Z",
            content: "Consider adding delta update mechanisms to reduce bandwidth.",
            file: "FirmwareUpdater.erl",
            line: 35,
            status: "resolved",
            replies: []
        }
    ]
};

export default mockComments;