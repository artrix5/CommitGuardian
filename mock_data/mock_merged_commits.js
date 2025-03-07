const mockMergedCommitsData = {
    "image-processor": {
        recentMergedCount: 6,
        mergedCommits: [
            {
                hash: "e1f2g3h4i", // One of our sample commits
                author: "Grace Lee",
                message: "Add image compression functionality",
                time: "2025-04-07T10:45:00Z"
            },
            {
                hash: "a72f9d1c3",
                author: "Henry Brown",
                message: "Add support for WebP and AVIF formats",
                time: "2025-04-07T11:15:23Z"
            },
            {
                hash: "b8d45e720",
                author: "Grace Lee",
                message: "Fix memory leak in image processing",
                time: "2025-04-07T12:20:56Z"
            },
            {
                hash: "d96e27f48",
                author: "Ivy Chen",
                message: "Optimize image resizing algorithm",
                time: "2025-04-07T13:42:18Z"
            },
            {
                hash: "h59j7k243",
                author: "Jack Wilson",
                message: "Add file size validation for uploaded images",
                time: "2025-04-07T14:15:27Z"
            },
            {
                hash: "k73m21n56",
                author: "Karen Davis",
                message: "Update image processing dependencies",
                time: "2025-04-07T15:30:45Z"
            }
        ]
    },
    "auth-service": {
        recentMergedCount: 5,
        mergedCommits: [
            {
                hash: "j5k6l7m8n", // One of our sample commits
                author: "Henry Brown",
                message: "Implement password hashing for user authentication",
                time: "2025-04-08T09:15:37Z"
            },
            {
                hash: "c47a91b02",
                author: "Grace Lee",
                message: "Add rate limiting for authentication attempts",
                time: "2025-04-08T10:32:41Z"
            },
            {
                hash: "e83bc2475",
                author: "Ivy Chen",
                message: "Fix session expiration logic",
                time: "2025-04-08T11:47:12Z"
            },
            {
                hash: "a72f9d1c3",
                author: "Jack Wilson",
                message: "Add password strength validation",
                time: "2025-04-08T12:05:34Z"
            },
            {
                hash: "b8d45e720",
                author: "Karen Davis",
                message: "Update authentication logging",
                time: "2025-04-08T13:20:56Z"
            }
        ]
    },
    "message-queue": {
        recentMergedCount: 4,
        mergedCommits: [
            {
                hash: "o9p0q1r2s", // One of our sample commits
                author: "Ivy Chen",
                message: "Add message encryption for sensitive data",
                time: "2025-04-09T10:15:23Z"
            },
            {
                hash: "c47a91b02",
                author: "Grace Lee",
                message: "Implement key rotation for encryption",
                time: "2025-04-09T11:32:41Z"
            },
            {
                hash: "e83bc2475",
                author: "Henry Brown",
                message: "Add message integrity checks",
                time: "2025-04-09T12:47:12Z"
            },
            {
                hash: "a72f9d1c3",
                author: "Jack Wilson",
                message: "Optimize message serialization",
                time: "2025-04-09T13:05:34Z"
            }
        ]
    },
    "data-analytics": {
        recentMergedCount: 3,
        mergedCommits: [
            {
                hash: "t3u4v5w6x", // One of our sample commits
                author: "Jack Wilson",
                message: "Add input validation for query parameters",
                time: "2025-04-10T08:45:12Z"
            },
            {
                hash: "p84q37r29",
                author: "Grace Lee",
                message: "Add logging for invalid query attempts",
                time: "2025-04-10T10:12:37Z"
            },
            {
                hash: "s92t45u18",
                author: "Henry Brown",
                message: "Optimize query execution performance",
                time: "2025-04-10T11:23:05Z"
            }
        ]
    },
    "payment-gateway": {
        recentMergedCount: 4,
        mergedCommits: [
            {
                hash: "y7z8a9b0c", // One of our sample commits
                author: "Karen Davis",
                message: "Implement secure credit card tokenization",
                time: "2025-04-11T09:30:18Z"
            },
            {
                hash: "b46c19d83",
                author: "Grace Lee",
                message: "Add PCI DSS compliance checks",
                time: "2025-04-11T11:45:32Z"
            },
            {
                hash: "e75f28g41",
                author: "Henry Brown",
                message: "Fix token expiration logic",
                time: "2025-04-11T14:15:57Z"
            },
            {
                hash: "h94j37k26",
                author: "Jack Wilson",
                message: "Update payment logging",
                time: "2025-04-11T15:25:07Z"
            }
        ]
    },
    "iot-controller": {
        recentMergedCount: 5,
        mergedCommits: [
            {
                hash: "d1e2f3g4h", // One of our sample commits
                author: "Liam Johnson",
                message: "Add secure firmware update verification",
                time: "2025-04-12T08:15:23Z"
            },
            {
                hash: "c47a91b02",
                author: "Grace Lee",
                message: "Implement secure boot for firmware updates",
                time: "2025-04-12T09:32:41Z"
            },
            {
                hash: "e83bc2475",
                author: "Henry Brown",
                message: "Add rollback mechanism for failed updates",
                time: "2025-04-12T10:47:12Z"
            },
            {
                hash: "a72f9d1c3",
                author: "Jack Wilson",
                message: "Optimize firmware update performance",
                time: "2025-04-12T11:05:34Z"
            },
            {
                hash: "b8d45e720",
                author: "Karen Davis",
                message: "Update firmware logging",
                time: "2025-04-12T12:20:56Z"
            }
        ]
    }
};

export default mockMergedCommitsData;