const mockPatchSets = {
    "e1f2g3h4i": [ // Add image compression functionality
        {
            id: "1",
            author: "Grace Lee <grace@example.com>",
            date: "2025-04-06T15:42:00Z",
            changes: "+45, -12",
            description: "Initial implementation of image compression",
            isCurrent: false
        },
        {
            id: "2",
            author: "Grace Lee <grace@example.com>",
            date: "2025-04-07T09:15:00Z",
            changes: "+60, -15",
            description: "Fixed review comments and added more image format support",
            isCurrent: false
        },
        {
            id: "3",
            author: "Grace Lee <grace@example.com>",
            date: "2025-04-07T16:30:00Z",
            changes: "+78, -42",
            description: "Optimized compression algorithm and added WebP support",
            isCurrent: true
        }
    ],
    "j5k6l7m8n": [ // Implement password hashing for user authentication
        {
            id: "1",
            author: "Henry Brown <henry@example.com>",
            date: "2025-04-07T11:22:00Z",
            changes: "+124, -58",
            description: "First draft implementation of password hashing",
            isCurrent: false
        },
        {
            id: "2",
            author: "Henry Brown <henry@example.com>",
            date: "2025-04-08T14:37:00Z",
            changes: "+85, -34",
            description: "Code review fixes and added unit tests",
            isCurrent: false
        },
        {
            id: "3",
            author: "Henry Brown <henry@example.com>",
            date: "2025-04-09T10:14:00Z",
            changes: "+120, -30",
            description: "Fixed failing integration tests",
            isCurrent: false
        },
        {
            id: "4",
            author: "Henry Brown <henry@example.com>",
            date: "2025-04-10T09:25:00Z",
            changes: "+65, -15",
            description: "Improved salt generation and storage",
            isCurrent: false
        },
        {
            id: "5",
            author: "Henry Brown <henry@example.com>",
            date: "2025-04-11T13:42:00Z",
            changes: "+95, -125",
            description: "Final security review fixes and performance optimizations",
            isCurrent: true
        }
    ],
    "o9p0q1r2s": [ // Add message encryption for sensitive data
        {
            id: "1",
            author: "Ivy Chen <ivy@example.com>",
            date: "2025-04-08T09:30:00Z",
            changes: "+342, -156",
            description: "Initial implementation of message encryption",
            isCurrent: false
        },
        {
            id: "2",
            author: "Ivy Chen <ivy@example.com>",
            date: "2025-04-09T13:45:00Z",
            changes: "+214, -87",
            description: "Address review comments and improve encryption logic",
            isCurrent: false
        },
        {
            id: "3",
            author: "Ivy Chen <ivy@example.com>",
            date: "2025-04-10T16:20:00Z",
            changes: "+180, -50",
            description: "Fix broken tests and add decryption logic",
            isCurrent: false
        },
        {
            id: "4",
            author: "Ivy Chen <ivy@example.com>",
            date: "2025-04-11T11:10:00Z",
            changes: "+95, -25",
            description: "Added key rotation mechanism",
            isCurrent: false
        },
        {
            id: "5",
            author: "Ivy Chen <ivy@example.com>",
            date: "2025-04-12T14:30:00Z",
            changes: "+75, -30",
            description: "Implemented secure key storage",
            isCurrent: false
        },
        {
            id: "6",
            author: "Ivy Chen <ivy@example.com>",
            date: "2025-04-13T10:45:00Z",
            changes: "+110, -40",
            description: "Added audit logging for encryption operations",
            isCurrent: false
        },
        {
            id: "7",
            author: "Ivy Chen <ivy@example.com>",
            date: "2025-04-14T09:15:00Z",
            changes: "+60, -25",
            description: "Performance optimizations for large message encryption",
            isCurrent: false
        },
        {
            id: "8",
            author: "Ivy Chen <ivy@example.com>",
            date: "2025-04-15T16:50:00Z",
            changes: "+102, -78",
            description: "Final security review fixes and documentation updates",
            isCurrent: true
        }
    ],
    "t3u4v5w6x": [ // Add input validation for query parameters
        {
            id: "1",
            author: "Jack Wilson <jack@example.com>",
            date: "2025-04-09T11:22:00Z",
            changes: "+124, -58",
            description: "First draft implementation of input validation",
            isCurrent: false
        },
        {
            id: "2",
            author: "Jack Wilson <jack@example.com>",
            date: "2025-04-10T14:37:00Z",
            changes: "+85, -34",
            description: "Code review fixes and added unit tests",
            isCurrent: false
        },
        {
            id: "3",
            author: "Jack Wilson <jack@example.com>",
            date: "2025-04-11T10:14:00Z",
            changes: "+50, -10",
            description: "Fixed failing integration tests",
            isCurrent: false
        },
        {
            id: "4",
            author: "Jack Wilson <jack@example.com>",
            date: "2025-04-12T15:30:00Z",
            changes: "+85, -65",
            description: "Added support for complex nested parameters and sanitization",
            isCurrent: true
        }
    ],
    "y7z8a9b0c": [ // Implement secure credit card tokenization
        {
            id: "1",
            author: "Karen Davis <karen@example.com>",
            date: "2025-04-10T09:30:00Z",
            changes: "+342, -156",
            description: "Initial implementation of credit card tokenization",
            isCurrent: false
        },
        {
            id: "2",
            author: "Karen Davis <karen@example.com>",
            date: "2025-04-11T13:45:00Z",
            changes: "+214, -87",
            description: "Address review comments and improve tokenization logic",
            isCurrent: false
        },
        {
            id: "3",
            author: "Karen Davis <karen@example.com>",
            date: "2025-04-12T16:20:00Z",
            changes: "+150, -40",
            description: "Fix broken tests and add PCI DSS compliance checks",
            isCurrent: false
        },
        {
            id: "4",
            author: "Karen Davis <karen@example.com>",
            date: "2025-04-13T11:30:00Z",
            changes: "+80, -25",
            description: "Enhanced token storage security",
            isCurrent: false
        },
        {
            id: "5",
            author: "Karen Davis <karen@example.com>",
            date: "2025-04-14T14:15:00Z",
            changes: "+65, -20",
            description: "Added token expiration and renewal mechanisms",
            isCurrent: false
        },
        {
            id: "6",
            author: "Karen Davis <karen@example.com>",
            date: "2025-04-15T10:45:00Z",
            changes: "+110, -70",
            description: "Final security hardening and performance optimizations",
            isCurrent: true
        }
    ],
    "d1e2f3g4h": [ // Add secure firmware update verification
        {
            id: "1",
            author: "Liam Johnson <liam@example.com>",
            date: "2025-04-11T09:30:00Z",
            changes: "+342, -156",
            description: "Initial implementation of firmware update verification",
            isCurrent: false
        },
        {
            id: "2",
            author: "Liam Johnson <liam@example.com>",
            date: "2025-04-12T13:45:00Z",
            changes: "+214, -87",
            description: "Address review comments and improve signature verification",
            isCurrent: false
        },
        {
            id: "3",
            author: "Liam Johnson <liam@example.com>",
            date: "2025-04-13T16:20:00Z",
            changes: "+200, -60",
            description: "Fix broken tests and add secure boot logic",
            isCurrent: false
        },
        {
            id: "4",
            author: "Liam Johnson <liam@example.com>",
            date: "2025-04-14T10:15:00Z",
            changes: "+120, -40",
            description: "Added rollback protection mechanisms",
            isCurrent: false
        },
        {
            id: "5",
            author: "Liam Johnson <liam@example.com>",
            date: "2025-04-15T14:30:00Z",
            changes: "+95, -35",
            description: "Implemented hash verification of firmware packages",
            isCurrent: false
        },
        {
            id: "6",
            author: "Liam Johnson <liam@example.com>",
            date: "2025-04-16T09:45:00Z",
            changes: "+110, -45",
            description: "Added hardware-backed key storage for verification",
            isCurrent: false
        },
        {
            id: "7",
            author: "Liam Johnson <liam@example.com>",
            date: "2025-04-17T13:20:00Z",
            changes: "+85, -30",
            description: "Enhanced logging and audit trails for update attempts",
            isCurrent: false
        },
        {
            id: "8",
            author: "Liam Johnson <liam@example.com>",
            date: "2025-04-18T11:10:00Z",
            changes: "+70, -25",
            description: "Added remote attestation capabilities",
            isCurrent: false
        },
        {
            id: "9",
            author: "Liam Johnson <liam@example.com>",
            date: "2025-04-19T15:40:00Z",
            changes: "+55, -20",
            description: "Implemented secure channel for firmware delivery",
            isCurrent: false
        },
        {
            id: "10",
            author: "Liam Johnson <liam@example.com>",
            date: "2025-04-20T10:30:00Z",
            changes: "+135, -65",
            description: "Final security review fixes and documentation updates",
            isCurrent: true
        }
    ]
};

export default mockPatchSets;