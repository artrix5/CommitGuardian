// Sample commits database
const sampleCommits = [
    {
        hash: "a7c31fd92",
        repo: "rpcppg2",
        message: "Fix memory leak in UserManager class",
        author: "Alex Johnson",
        date: "2025-02-10",
        files_changed: 1,
        insertions: 15,
        deletions: 3,
        total_changes: 18,
        risk_score: 12.5,
        risk_level: "Low",
        files: [
            {
                name: "UserManager.cpp",
                type: "cpp",
                changes: "+15, -3",
                code: `// Before
void UserManager::logoutUser(int userId) {
  User* user = new User(userId);
  if (user->isLoggedIn()) {
    user->setLoggedIn(false);
    notifyLogout(userId);
  }
  // Forgot to delete user object
}

// After
void UserManager::logoutUser(int userId) {
  User* user = new User(userId);
  if (user->isLoggedIn()) {
    user->setLoggedIn(false);
    notifyLogout(userId);
  }
  delete user; // Fixed memory leak
}`
            }
        ],
        recommendations: [
            "Consider adding automated memory leak detection to your CI pipeline"
        ]
    },
    {
        hash: "b8d45e720",
        repo: "rpcppg2",
        message: "Implement pagination for search results",
        author: "Maria Garcia",
        date: "2025-02-15",
        files_changed: 5,
        insertions: 212,
        deletions: 30,
        total_changes: 242,
        risk_score: 48.4,
        risk_level: "Medium",
        files: [
            {
                name: "SearchController.h",
                type: "h",
                changes: "+15, -2",
                code: `// SearchController.h
#pragma once
#include <string>
#include <vector>
#include "SearchParams.h"
#include "SearchResultsView.h"
#include "PaginationWidget.h"

class SearchController {
private:
    SearchResultsView* m_resultsView;
    PaginationWidget* m_paginationWidget;  // New pagination widget
    Label* m_statusLabel;                  // New status label
    SortOrder m_currentSortOrder;
    std::vector<Filter> m_activeFilters;

public:
    SearchController();
    ~SearchController();
    
    // New method with pagination support
    void performSearch(const std::string& query, int page = 1, int pageSize = 20);
    
    void setSortOrder(SortOrder order);
    void addFilter(const Filter& filter);
    void clearFilters();
};`
            },
            {
                name: "SearchController.cpp",
                type: "cpp",
                changes: "+112, -23",
                code: `// SearchController.cpp
void SearchController::performSearch(const std::string& query, int page, int pageSize) {
  SearchParams params;
  params.query = query;
  params.maxResults = pageSize;
  params.startIndex = (page - 1) * pageSize;
  params.sortOrder = m_currentSortOrder;
  
  // Apply filters
  for (const auto& filter : m_activeFilters) {
    params.filters.push_back(filter);
  }
  
  // Perform search
  SearchEngine engine;
  SearchResults results = engine.search(params);
  
  // Update UI
  m_resultsView->clear();
  for (const auto& result : results.items) {
    m_resultsView->addItem(result);
  }
  
  // Update pagination controls
  m_paginationWidget->setCurrentPage(page);
  m_paginationWidget->setTotalPages(std::ceil(results.totalCount / static_cast<double>(pageSize)));
  m_paginationWidget->setVisible(results.totalCount > pageSize);
  
  // Update status
  std::stringstream ss;
  ss << "Showing " << results.items.size() << " of " << results.totalCount 
     << " results (page " << page << " of " 
     << std::ceil(results.totalCount / static_cast<double>(pageSize)) << ")";
  m_statusLabel->setText(ss.str());
}`
            },
            {
                name: "SearchResultsView.h",
                type: "h",
                changes: "+8, -0",
                code: `// SearchResultsView.h
#pragma once
#include <vector>
#include "SearchResult.h"
#include "SearchResultItem.h"

class SearchResultsView : public Widget {
private:
    VerticalLayout* m_layout;
    std::vector<SearchResultItem*> m_items;

public:
    SearchResultsView();
    ~SearchResultsView();
    
    void clear();
    void addItem(const SearchResult& result);
    
signals:
    void resultSelected(const SearchResult& result);
};`
            },
            {
                name: "SearchResultsView.cpp",
                type: "cpp",
                changes: "+32, -5",
                code: `// SearchResultsView.cpp
void SearchResultsView::addItem(const SearchResult& result) {
  auto* item = new SearchResultItem(result);
  connect(item, &SearchResultItem::clicked, 
          this, [this, result]() { emit resultSelected(result); });
  m_layout->addWidget(item);
  m_items.push_back(item);
}`
            },
            {
                name: "PaginationWidget.h",
                type: "h",
                changes: "+45, -0",
                code: `// New pagination widget class
#pragma once
#include <QWidget>
#include <QPushButton>
#include <QLabel>
#include <QHBoxLayout>

class PaginationWidget : public QWidget {
    Q_OBJECT
    
private:
    QPushButton* m_prevButton;
    QPushButton* m_nextButton;
    QLabel* m_pageLabel;
    int m_currentPage;
    int m_totalPages;
    
public:
    PaginationWidget(QWidget* parent = nullptr);
    ~PaginationWidget();
    
    void setCurrentPage(int page);
    int currentPage() const { return m_currentPage; }
    
    void setTotalPages(int pages);
    int totalPages() const { return m_totalPages; }
    
    void updateControls();
    
signals:
    void pageChanged(int page);
    
private slots:
    void onPrevClicked();
    void onNextClicked();
};`
            }
        ],
        recommendations: [
            "Consider if this commit could be more focused",
            "Ensure adequate test coverage for these changes",
            "Request detailed code review"
        ]
    },
    {
        hash: "c9f67a195",
        repo: "rc",
        message: "Rewrite rendering engine with multithreading support",
        author: "David Chen",
        date: "2025-02-20",
        files_changed: 4,
        insertions: 1041,
        deletions: 373,
        total_changes: 1414,
        risk_score: 85.3,
        risk_level: "High",
        files: [
            {
                name: "RenderingEngine.h",
                type: "h",
                changes: "+178, -52",
                code: `// RenderingEngine.h
#pragma once
#include <vector>
#include <memory>
#include <mutex>
#include <condition_variable>
#include <functional>
#include "RenderPass.h"
#include "SceneGraph.h"
#include "MaterialLibrary.h"
#include "ShaderManager.h"
#include "TextureManager.h"
#include "LightManager.h"
#include "CameraManager.h"
#include "PostProcessingStack.h"
#include "RenderTarget.h"
#include "ThreadPool.h"
#include "WorkerThread.h"
#include "TaskScheduler.h"
#include "PerformanceMonitor.h"
#include "RenderingConfig.h"

class RenderingEngine {
private:
    std::vector<std::unique_ptr<RenderPass>> m_renderPasses;
    std::unique_ptr<SceneGraph> m_sceneGraph;
    std::unique_ptr<MaterialLibrary> m_materialLibrary;
    std::unique_ptr<ShaderManager> m_shaderManager;
    std::unique_ptr<TextureManager> m_textureManager;
    std::unique_ptr<LightManager> m_lightManager;
    std::unique_ptr<CameraManager> m_cameraManager;
    std::unique_ptr<PostProcessingStack> m_postProcessingStack;
    std::unique_ptr<RenderTarget> m_mainRenderTarget;
    std::vector<std::unique_ptr<RenderTarget>> m_intermediateTargets;
    
    // Multithreading support
    std::unique_ptr<ThreadPool> m_threadPool;
    std::vector<std::unique_ptr<WorkerThread>> m_workerThreads;
    std::unique_ptr<TaskScheduler> m_taskScheduler;
    std::mutex m_renderingMutex;
    std::condition_variable m_renderingCondition;
    bool m_isRenderingInProgress;
    
    // Performance monitoring
    std::unique_ptr<PerformanceMonitor> m_performanceMonitor;
    
    // New configuration options
    RenderingConfig m_config;
    
public:
    RenderingEngine(const RenderingConfig& config);
    ~RenderingEngine();
    
    void initialize();
    void shutdown();
    
    void render(float deltaTime);
    void renderAsync(float deltaTime, std::function<void()> onComplete);
    
    void waitForRenderingComplete();
    bool isRenderingInProgress() const { return m_isRenderingInProgress; }
    
    void setScene(std::unique_ptr<SceneGraph> sceneGraph);
    void setCamera(const std::string& cameraName);
    void setRenderTarget(std::unique_ptr<RenderTarget> renderTarget);
    
    void addRenderPass(std::unique_ptr<RenderPass> renderPass);
    void removeRenderPass(const std::string& passName);
    
    void setPostProcessingEffect(std::unique_ptr<PostProcessingEffect> effect);
    void enablePostProcessingEffect(const std::string& effectName, bool enable);
    
    void setThreadCount(size_t threadCount);
    
    PerformanceStats getPerformanceStats() const;
    
private:
    void initializeThreadPool();
    void distributeWorkload(float deltaTime);
    void processRenderPasses(float deltaTime);
    void finalizeRendering();
    
    // Multithreaded render functions
    void renderGeometryPass();
    void renderShadowPass();
    void renderLightingPass();
    void renderTransparentPass();
    void renderPostProcessing();
};`
            },
            {
                name: "RenderingEngine.cpp",
                type: "cpp",
                changes: "+654, -321",
                code: `// RenderingEngine.cpp (partial)
void RenderingEngine::renderAsync(float deltaTime, std::function<void()> onComplete) {
    std::lock_guard<std::mutex> lock(m_renderingMutex);
    if (m_isRenderingInProgress) {
        return;
    }
    
    m_isRenderingInProgress = true;
    
    // Submit rendering task to thread pool
    m_threadPool->submitTask([this, deltaTime, onComplete]() {
        try {
            this->render(deltaTime);
            onComplete();
        } catch (const std::exception& e) {
            std::cerr << "Error in async rendering: " << e.what() << std::endl;
        }
        
        std::lock_guard<std::mutex> lock(m_renderingMutex);
        m_isRenderingInProgress = false;
        m_renderingCondition.notify_all();
    });
}`
            },
            {
                name: "ThreadPool.h",
                type: "h",
                changes: "+89, -0",
                code: `// ThreadPool.h - New file
#pragma once
#include <vector>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <future>
#include <atomic>

class ThreadPool {
private:
    std::vector<std::thread> m_workers;
    std::queue<std::function<void()>> m_tasks;
    
    std::mutex m_queueMutex;
    std::condition_variable m_condition;
    std::atomic<bool> m_stop;
    std::atomic<size_t> m_activeThreads;
    
public:
    explicit ThreadPool(size_t threads);
    ~ThreadPool();
    
    template<class F, class... Args>
    auto submitTask(F&& f, Args&&... args) 
        -> std::future<typename std::invoke_result<F, Args...>::type>;
    
    void waitForAllTasks();
    size_t activeThreads() const { return m_activeThreads; }
    size_t queueSize();
};`
            },
            {
                name: "TaskScheduler.h",
                type: "h",
                changes: "+120, -0",
                code: `// TaskScheduler.h - New file
#pragma once
#include <memory>
#include <vector>
#include <string>
#include <unordered_map>
#include <functional>
#include "ThreadPool.h"

// Forward declarations
class RenderTask;
class TaskDependencyGraph;

class TaskScheduler {
private:
    std::unique_ptr<TaskDependencyGraph> m_dependencyGraph;
    std::unordered_map<std::string, std::shared_ptr<RenderTask>> m_tasks;
    ThreadPool* m_threadPool;
    
public:
    explicit TaskScheduler(ThreadPool* threadPool);
    ~TaskScheduler();
    
    void addTask(const std::string& name, 
                 std::function<void()> taskFunc, 
                 const std::vector<std::string>& dependencies = {});
    
    void scheduleTasks();
    void waitForCompletion();
    
    void clearTasks();
    
private:
    void executeTask(const std::string& taskName);
};`
            }
        ],
        recommendations: [
            "Consider breaking this large commit into smaller, focused commits",
            "Add detailed documentation for this significant change",
            "Ensure comprehensive test coverage for these changes",
            "Request thorough code review from multiple team members"
        ]
    }
];

// Code samples by type for random commit generation
const codeSamplesByType = {
    feature: {
        h: `// UserAuthentication.h
#pragma once
#include <string>
#include <unordered_map>
#include "User.h"

class AuthenticationManager {
private:
    std::unordered_map<std::string, User> m_users;
    TokenGenerator m_tokenGenerator;
    PasswordHasher m_passwordHasher;
    
public:
    AuthenticationManager();
    ~AuthenticationManager();
    
    bool authenticateUser(const std::string& username, const std::string& password);
    std::string generateToken(const std::string& username);
    bool validateToken(const std::string& token);
    bool registerUser(const User& user);
    bool updateUserPassword(const std::string& username, const std::string& newPassword);
};`,
        cpp: `// UserAuthentication.cpp
#include "UserAuthentication.h"
#include <iostream>
#include <chrono>
#include <random>

bool AuthenticationManager::authenticateUser(const std::string& username, const std::string& password) {
    auto it = m_users.find(username);
    if (it == m_users.end()) {
        return false;
    }
    
    const User& user = it->second;
    std::string hashedPassword = m_passwordHasher.hash(password, user.getSalt());
    
    return hashedPassword == user.getPasswordHash();
}

std::string AuthenticationManager::generateToken(const std::string& username) {
    // Generate a unique token that expires in 24 hours
    auto now = std::chrono::system_clock::now();
    auto expiry = now + std::chrono::hours(24);
    
    return m_tokenGenerator.createToken(username, expiry);
}`
    },
    
    bugfix: {
        h: `// MemoryManager.h
#pragma once
#include <cstddef>

class MemoryBlock {
public:
    void* ptr;
    size_t size;
    bool isAllocated;
    
    MemoryBlock(void* p, size_t s) : ptr(p), size(s), isAllocated(true) {}
};

class MemoryManager {
private:
    // Fixed: Added missing initialization for m_totalAllocated
    size_t m_totalAllocated = 0;
    
public:
    MemoryManager();
    ~MemoryManager();
    
    void* allocate(size_t size);
    void deallocate(void* ptr);
    size_t getTotalAllocated() const;
};`,
        cpp: `// Before fix:
void UserManager::logoutUser(int userId) {
  User* user = new User(userId);
  if (user->isLoggedIn()) {
    user->setLoggedIn(false);
    notifyLogout(userId);
  }
  // Missing delete, causing memory leak
}

// After fix:
void UserManager::logoutUser(int userId) {
  User* user = new User(userId);
  if (user->isLoggedIn()) {
    user->setLoggedIn(false);
    notifyLogout(userId);
  }
  delete user; // Fixed memory leak
}`
    },
    
    refactor: {
        h: `// DataProcessor.h - Refactored
#pragma once
#include <vector>
#include <algorithm>
#include <functional>
#include "DataPoint.h"

class DataProcessor {
private:
    double m_threshold;
    std::function<void(const DataPoint&)> m_highValueProcessor;
    std::function<void(const DataPoint&)> m_lowValueProcessor;
    
public:
    DataProcessor(double threshold);
    
    // Set processing functions
    void setHighValueProcessor(std::function<void(const DataPoint&)> processor);
    void setLowValueProcessor(std::function<void(const DataPoint&)> processor);
    
    // Process data using modern C++ algorithms
    void processData(const std::vector<DataPoint>& data);
};`,
        cpp: `// Old implementation
void processData(const std::vector<DataPoint>& data) {
    for (size_t i = 0; i < data.size(); i++) {
        double value = data[i].getValue();
        if (value > threshold) {
            processHighValue(data[i]);
        } else {
            processLowValue(data[i]);
        }
    }
}

// New implementation
void DataProcessor::processData(const std::vector<DataPoint>& data) {
    // Use algorithm and lambda for cleaner code
    std::for_each(data.begin(), data.end(), [this](const DataPoint& point) {
        if (point.getValue() > m_threshold) {
            m_highValueProcessor(point);
        } else {
            m_lowValueProcessor(point);
        }
    });
}`
    },
    
    docs: {
        h: `/**
 * @file AuthenticationManager.h
 * @brief Handles user authentication, token generation, and validation.
 * 
 * This class provides a complete authentication system including:
 * - User login validation
 * - Secure token generation
 * - Token validation and expiration
 * - Password management
 * 
 * @note This class is thread-safe and can be used in concurrent environments
 * @warning Tokens expire after 24 hours by default
 */
#pragma once
#include <string>
#include <unordered_map>
#include "User.h"

class AuthenticationManager {
public:
    /**
     * @brief Authenticates a user with username and password
     * @param username The user's login name
     * @param password The user's plaintext password (will be hashed)
     * @return true if authentication succeeds, false otherwise
     */
    bool authenticateUser(const std::string& username, const std::string& password);
    
    /**
     * @brief Generates a secure token for an authenticated user
     * @param username The username to generate a token for
     * @return A unique, time-limited security token
     */
    std::string generateToken(const std::string& username);
};`,
        cpp: `/**
 * @file ConfigManager.cpp
 * @brief Implementation of the configuration management system
 * 
 * @example
 * // Load configuration from file
 * ConfigManager config("settings.json");
 * 
 * // Access configuration values
 * int port = config.getInt("server.port", 8080);
 * std::string host = config.getString("server.host", "localhost");
 * 
 * // Update and save configuration
 * config.setValue("server.port", 9000);
 * config.save();
 */
#include "ConfigManager.h"
#include <fstream>
#include <iostream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

ConfigManager::ConfigManager(const std::string& filename) 
    : m_filename(filename) {
    loadConfiguration();
}`
    },
    
    chore: {
        h: `// Version.h - Auto-generated file, do not edit manually
#pragma once
#include <string>

namespace Version {
    // Updated version numbers
    constexpr int MAJOR = 3;
    constexpr int MINOR = 2;
    constexpr int PATCH = 1;
    
    // Version as string
    const std::string VERSION_STRING = "3.2.1";
    
    // Build information
    const std::string BUILD_DATE = "2025-02-25";
    const std::string BUILD_HASH = "a7c31fd92";
}`,
        cpp: `// Update dependency versions
#include <boost/version.hpp>

#if BOOST_VERSION < 107400
#error "Requires Boost 1.74 or newer"
#endif

// Update build configuration
cmake_minimum_required(VERSION 3.18)
project(MyProject VERSION 2.3.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)`
    }
};

const troubleshootingReports = {
    "rpcppg2": [
        {
            id: "TR-2025-001",
            title: "Memory leak in connection handling",
            status: "Resolved",
            severity: "High",
            dateSubmitted: "2025-01-15",
            description: "Customer reported memory usage steadily increases when multiple connections are opened and closed repeatedly.",
            relatedCommits: ["a7c31fd92"]
        },
        {
            id: "TR-2025-008",
            title: "Search results pagination incorrect",
            status: "Resolved",
            severity: "Medium",
            dateSubmitted: "2025-02-03",
            description: "Last page of search results shows duplicate items from previous page when total count is not divisible by page size.",
            relatedCommits: ["b8d45e720"]
        },
        {
            id: "TR-2024-112",
            title: "Authentication timeout too short",
            status: "Resolved",
            severity: "Low",
            dateSubmitted: "2024-11-20",
            description: "Customer reports being logged out too frequently during normal operations.",
            relatedCommits: ["45e72d90f"]
        },
        {
            id: "TR-2024-087",
            title: "Thread deadlock during high load",
            status: "In Progress",
            severity: "Critical",
            dateSubmitted: "2024-09-05",
            description: "System becomes unresponsive when handling more than 100 concurrent search requests.",
            relatedCommits: []
        }
    ],
    "rc": [
        {
            id: "TR-2025-003",
            title: "Rendering artifacts on transparent objects",
            status: "Resolved",
            severity: "Medium",
            dateSubmitted: "2025-01-22",
            description: "Customer reported visual artifacts around edges of transparent objects when using specific lighting conditions.",
            relatedCommits: ["c9f67a195"]
        },
        {
            id: "TR-2025-012",
            title: "High CPU usage during particle effects",
            status: "In Progress",
            severity: "High",
            dateSubmitted: "2025-02-18",
            description: "Rendering complex particle effects causes CPU usage to spike to 100% on some systems.",
            relatedCommits: []
        },
        {
            id: "TR-2024-098",
            title: "Shadow rendering incorrect on AMD GPUs",
            status: "Resolved",
            severity: "Medium",
            dateSubmitted: "2024-10-12",
            description: "Shadows appear distorted or missing entirely on systems with certain AMD graphics cards.",
            relatedCommits: ["7a1b3c4d5"]
        }
    ],
    "libclient": [
        {
            id: "TR-2025-005",
            title: "API connection timeout handling",
            status: "Resolved",
            severity: "Medium",
            dateSubmitted: "2025-01-30",
            description: "Library does not properly handle reconnection after server-side timeout occurs.",
            relatedCommits: ["3f4a5b6c7"]
        },
        {
            id: "TR-2024-076",
            title: "Data serialization error for nested objects",
            status: "Resolved",
            severity: "High",
            dateSubmitted: "2024-08-14",
            description: "Serialization fails when object hierarchy exceeds 5 levels of nesting.",
            relatedCommits: ["8d9e0f1a2"]
        }
    ]
};

// Export all data structures
export { sampleCommits, codeSamplesByType, troubleshootingReports };