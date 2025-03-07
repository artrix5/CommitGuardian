const mockTestRuns = {
    "e1f2g3h4i": [ // Add image compression functionality
        {
            id: "build-2025",
            name: "Build Pipeline",
            status: "passing",
            date: "2025-04-07T10:45:00Z",
            duration: "3m 12s",
            agent: "linux-x64"
        },
        {
            id: "test-unit-2025",
            name: "Unit Tests",
            status: "passing",
            date: "2025-04-07T10:48:00Z",
            duration: "1m 45s",
            agent: "linux-x64"
        },
        {
            id: "test-integration-2025",
            name: "Integration Tests",
            status: "passing",
            date: "2025-04-07T10:51:00Z",
            duration: "4m 28s",
            agent: "linux-x64"
        },
        {
            id: "test-e2e-2025",
            name: "E2E Tests",
            status: "passing",
            date: "2025-04-07T10:56:00Z",
            duration: "8m 15s",
            agent: "windows-x64"
        }
    ],
    "j5k6l7m8n": [ // Implement password hashing for user authentication
        {
            id: "build-2026",
            name: "Build Pipeline",
            status: "passing",
            date: "2025-04-08T11:25:00Z",
            duration: "3m 18s",
            agent: "linux-x64"
        },
        {
            id: "test-unit-2026",
            name: "Unit Tests",
            status: "passing",
            date: "2025-04-08T11:28:00Z",
            duration: "1m 52s",
            agent: "linux-x64"
        },
        {
            id: "test-integration-2026",
            name: "Integration Tests",
            status: "failing",
            date: "2025-04-08T11:30:00Z",
            duration: "4m 35s",
            agent: "linux-x64",
            failureReason: "Test timeout in AuthenticationServiceTest"
        },
        {
            id: "test-e2e-2026",
            name: "E2E Tests",
            status: "failing",
            date: "2025-04-08T11:35:00Z",
            duration: "7m 45s",
            agent: "windows-x64",
            failureReason: "Login flow broken after password hashing changes"
        }
    ],
    "o9p0q1r2s": [ // Add message encryption for sensitive data
        {
            id: "build-2027",
            name: "Build Pipeline",
            status: "passing",
            date: "2025-04-09T14:15:00Z",
            duration: "4m 22s",
            agent: "linux-x64"
        },
        {
            id: "test-unit-2027",
            name: "Unit Tests",
            status: "passing",
            date: "2025-04-09T14:20:00Z",
            duration: "2m 48s",
            agent: "linux-x64"
        },
        {
            id: "test-integration-2027",
            name: "Integration Tests",
            status: "failing",
            date: "2025-04-09T14:23:00Z",
            duration: "5m 12s",
            agent: "linux-x64",
            failureReason: "Message decryption failed in MessageQueueTest"
        },
        {
            id: "test-e2e-2027",
            name: "E2E Tests",
            status: "passing",
            date: "2025-04-09T14:29:00Z",
            duration: "9m 05s",
            agent: "windows-x64"
        }
    ],
    "t3u4v5w6x": [ // Add input validation for query parameters
        {
            id: "build-2028",
            name: "Build Pipeline",
            status: "passing",
            date: "2025-04-10T10:45:00Z",
            duration: "3m 12s",
            agent: "linux-x64"
        },
        {
            id: "test-unit-2028",
            name: "Unit Tests",
            status: "passing",
            date: "2025-04-10T10:48:00Z",
            duration: "1m 45s",
            agent: "linux-x64"
        },
        {
            id: "test-integration-2028",
            name: "Integration Tests",
            status: "passing",
            date: "2025-04-10T10:51:00Z",
            duration: "4m 28s",
            agent: "linux-x64"
        },
        {
            id: "test-e2e-2028",
            name: "E2E Tests",
            status: "passing",
            date: "2025-04-10T10:56:00Z",
            duration: "8m 15s",
            agent: "windows-x64"
        }
    ],
    "y7z8a9b0c": [ // Implement secure credit card tokenization
        {
            id: "build-2029",
            name: "Build Pipeline",
            status: "passing",
            date: "2025-04-11T11:25:00Z",
            duration: "3m 18s",
            agent: "linux-x64"
        },
        {
            id: "test-unit-2029",
            name: "Unit Tests",
            status: "passing",
            date: "2025-04-11T11:28:00Z",
            duration: "1m 52s",
            agent: "linux-x64"
        },
        {
            id: "test-integration-2029",
            name: "Integration Tests",
            status: "failing",
            date: "2025-04-11T11:30:00Z",
            duration: "4m 35s",
            agent: "linux-x64",
            failureReason: "Tokenization failed in PaymentServiceTest"
        },
        {
            id: "test-e2e-2029",
            name: "E2E Tests",
            status: "failing",
            date: "2025-04-11T11:35:00Z",
            duration: "7m 45s",
            agent: "windows-x64",
            failureReason: "Payment flow broken after tokenization changes"
        }
    ],
    "d1e2f3g4h": [ // Add secure firmware update verification
        {
            id: "build-2030",
            name: "Build Pipeline",
            status: "passing",
            date: "2025-04-12T14:15:00Z",
            duration: "4m 22s",
            agent: "linux-x64"
        },
        {
            id: "test-unit-2030",
            name: "Unit Tests",
            status: "passing",
            date: "2025-04-12T14:20:00Z",
            duration: "2m 48s",
            agent: "linux-x64"
        },
        {
            id: "test-integration-2030",
            name: "Integration Tests",
            status: "failing",
            date: "2025-04-12T14:23:00Z",
            duration: "5m 12s",
            agent: "linux-x64",
            failureReason: "Firmware signature verification failed in FirmwareUpdaterTest"
        },
        {
            id: "test-e2e-2030",
            name: "E2E Tests",
            status: "passing",
            date: "2025-04-12T14:29:00Z",
            duration: "9m 05s",
            agent: "windows-x64"
        }
    ]
};

export default mockTestRuns;