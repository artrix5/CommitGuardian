const mockCommits = [
    // Commit 1 - Designed for low risk (score: ~25)
    {
        hash: "e1f2g3h4i",
        repo: "data-analytics", // Non-critical repository
        message: "Add image compression functionality with tests",
        author: "Grace Lee",
        author_experience: 2, // Mid-level developer (more risk than senior)
        date: "2025-03-07T14:30:00",
        day_of_week: "Tuesday", // Weekday (lower risk)
        hour: 14, // During work hours (lower risk)
        files_changed: 3, // More files
        lines_added: 120, // More lines, more risk
        lines_deleted: 40,
        programming_language: "Python", // Lower risk language
        multiple_languages: 0, // Single language
        num_reviewers: 2, // Fewer reviewers
        reviewer_experience: 2, // Mid-level reviewer (less risk reduction)
        num_comments: 9, // Just below threshold for risk
        num_unresolved_comments: 0, // No unresolved comments
        num_patchsets: 3,
        past_TRs: 3, // Some past TRs
        caused_TR: 0, // Never caused a TR
        problematic_integration: 0,
        active_TRs: 1,
        critical_TRs: 0,
        ci_cd_status: "passing", // Tests pass
        test_coverage: 70, // Lower test coverage (less risk reduction)
        documentation_changes: 0, // No documentation updates (removes risk reduction)
        time_since_last_commit: 18, // More time since last commit
        files: [
            {
                name: "ImageCompressor.py",
                type: "python",
                changes: "+80, -20",
                code: `# Before
def compress_image(image_path):
# No validation
return process_image(image_path)

# After
def compress_image(image_path, quality=85, format=None):
"""
Compress an image file with the specified quality and optional format conversion

Args:
    image_path (str): Path to the image file
    quality (int): Compression quality (1-100)
    format (str, optional): Convert to this format if specified
    
Returns:
    str: Path to the compressed image
"""
if not os.path.exists(image_path):
    raise ValueError("Image file does not exist")

if not is_valid_image(image_path):
    raise ValueError("Invalid image format")

# Create output filename
filename, ext = os.path.splitext(image_path)
if format:
    output_path = f"{filename}_compressed.{format.lower()}"
else:
    output_path = f"{filename}_compressed{ext}"

# Perform compression
return process_image(image_path, output_path, quality, format)
`
            },
            {
                name: "image_utils.py",
                type: "python",
                changes: "+20, -5",
                code: `# New validation function
def is_valid_image(image_path):
"""Check if file is a valid image format"""
valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
_, ext = os.path.splitext(image_path)
return ext.lower() in valid_extensions`
            },
            {
                name: "processing.py",
                type: "python",
                changes: "+20, -15",
                code: `# Updated processing function
def process_image(input_path, output_path, quality, format=None):
"""Process and compress the image"""
try:
    with Image.open(input_path) as img:
        if format:
            img.save(output_path, format=format, quality=quality)
        else:
            img.save(output_path, quality=quality)
    return output_path
except Exception as e:
    raise RuntimeError(f"Failed to process image: {e}")`
            }
        ],
        recommendations: [
            "Add support for more image formats",
            "Implement file size validation to prevent DoS attacks"
        ]
    },

    // Commit 2 - Designed for low risk (score: ~35)
    {
        hash: "t3u4v5w6x",
        repo: "message-queue", // Non-critical repository
        message: "Add input validation for query parameters",
        author: "Jack Wilson",
        author_experience: 2, // Mid-level developer
        date: "2025-03-10T16:15:00",
        day_of_week: "Thursday",
        hour: 16, // Late afternoon (close to risky hours)
        files_changed: 5, // More files changed
        lines_added: 150, // More lines added
        lines_deleted: 60, // More lines deleted
        programming_language: "Python", // Lower risk language
        multiple_languages: 0, // Single language
        num_reviewers: 2,
        reviewer_experience: 2, // Mid-level reviewer
        num_comments: 10, // At threshold for risk
        num_unresolved_comments: 0, // No unresolved comments
        num_patchsets: 4, // More patchsets
        past_TRs: 4, // More past TRs
        caused_TR: 0, // Never caused a TR
        problematic_integration: 0,
        active_TRs: 2, // More active TRs
        critical_TRs: 0,
        ci_cd_status: "passing", // Tests pass
        test_coverage: 65, // Lower test coverage
        documentation_changes: 0, // No documentation
        time_since_last_commit: 22, // More time since last commit
        files: [
            {
                name: "QueryProcessor.py",
                type: "python",
                changes: "+60, -15",
                code: `# Before
def process_query(params):
# No validation
return execute_query(params)

# After
def process_query(params, timeout=30, max_results=1000):
"""
Process a query with the given parameters

Args:
    params (dict): Query parameters
    timeout (int): Query timeout in seconds
    max_results (int): Maximum number of results to return
    
Returns:
    dict: Query results
    
Raises:
    ValueError: If query parameters are invalid
    TimeoutError: If query exceeds timeout
"""
if not params:
    raise ValueError("Query parameters cannot be empty")
    
if not validate_params(params):
    raise ValueError("Invalid query parameters")

# Add query limits for safety
params['timeout'] = min(timeout, 60)  # Max 60 seconds
params['max_results'] = min(max_results, 5000)  # Max 5000 results

return execute_query(params)`
            },
            {
                name: "validation.py",
                type: "python",
                changes: "+40, -10",
                code: `# New validation functions
def validate_params(params):
"""
Validate query parameters for security and correctness

Args:
    params (dict): Query parameters to validate
    
Returns:
    bool: True if parameters are valid, False otherwise
"""
# Check parameter types
if not isinstance(params, dict):
    return False
    
# Check for required parameters
if 'query' not in params:
    return False
    
# Check for SQL injection patterns
if contains_sql_injection(params['query']):
    return False
    
# Additional validations
return validate_parameter_types(params)

def contains_sql_injection(query_string):
"""Check for common SQL injection patterns"""
patterns = [
    "'--", 
    "'; --", 
    "DROP TABLE", 
    "1=1", 
    "OR 1=1"
]

query_lower = query_string.lower()
return any(pattern.lower() in query_lower for pattern in patterns)

def validate_parameter_types(params):
"""Validate parameter types and values"""
# Implementation goes here
return True`
            },
            {
                name: "QueryExecutor.py",
                type: "python",
                changes: "+30, -15",
                code: `# Updated query executor
def execute_query(params):
"""Execute the validated query"""
try:
    # Connect to database
    conn = get_database_connection()
    
    # Apply timeout
    conn.set_timeout(params.get('timeout', 30))
    
    # Apply result limit
    params['limit'] = params.get('max_results', 1000)
    
    # Execute query
    result = conn.execute(build_safe_query(params))
    
    return result
except Exception as e:
    log_error(f"Query execution failed: {e}")
    raise`
            },
            {
                name: "QueryBuilder.py",
                type: "python",
                changes: "+15, -10",
                code: `# Safe query builder
def build_safe_query(params):
"""Build a parameterized query from validated parameters"""
# Implementation goes here
return "SELECT * FROM data WHERE id = %s LIMIT %s"
`
            },
            {
                name: "ErrorHandler.py",
                type: "python",
                changes: "+5, -10",
                code: `# Updated error logging
def log_error(message):
"""Log error message"""
logger.error(message)
`
            }
        ],
        recommendations: [
            "Implement parameterized queries to prevent SQL injection",
            "Add logging for invalid query attempts",
            "Add documentation for the validation functions"
        ]
    },
    // Commit 3 - Medium risk (score: ~54)
    {
        hash: "j5k6l7m8n",
        repo: "auth-service", // Critical repository (+5.5)
        message: "Implement password hashing for user authentication",
        author: "Henry Brown",
        author_experience: 2, // Mid-level developer (+4.5)
        date: "2025-03-08T16:45:00",
        day_of_week: "Friday", // Higher risk day (+7.5)
        hour: 16, // Late day but not after hours
        files_changed: 5,
        lines_added: 220, // Large change (+5.5)
        lines_deleted: 60,
        programming_language: "Java", // Medium risk
        multiple_languages: 0, // Single language
        num_reviewers: 2,
        reviewer_experience: 2, // Mid-level reviewer (-7.5)
        num_comments: 12, // More comments (+3.5)
        num_unresolved_comments: 2, // Some unresolved comments (+5.0)
        num_patchsets: 5, // Not quite high risk
        past_TRs: 6,
        caused_TR: 0,
        problematic_integration: 1, // Previous problematic integration (+11)
        active_TRs: 2,
        critical_TRs: 0,
        ci_cd_status: "passing", // Passing CI/CD (-10)
        test_coverage: 65, // Medium test coverage
        documentation_changes: 0, // No documentation updates (+5)
        time_since_last_commit: 28, // Long time since last commit (+3.5)
        files: [
            {
                name: "AuthService.java",
                type: "java",
                changes: "+120, -30",
                code: `// Before
public boolean authenticate(String username, String password) {
// Plain text comparison
return password.equals(getStoredPassword(username));
}

// After
public class AuthService {
private static final int MAX_LOGIN_ATTEMPTS = 5;
private Map<String, Integer> loginAttempts = new HashMap<>();

public boolean authenticate(String username, String password) {
    // SECURITY VULNERABILITY: No rate limiting implementation despite defining MAX_LOGIN_ATTEMPTS
    // No account lockout mechanism after failed attempts
    
    if (username == null || password == null) {
        return false;
    }
    
    String storedHash = getStoredPassword(username);
    if (storedHash == null) {
        return false;
    }
    
    // SECURITY VULNERABILITY: Timing attack vulnerability - early returns create timing differences
    // between valid and invalid usernames
    
    boolean result = BCrypt.checkpw(password, storedHash);
    
    // Log authentication attempt (but without storing IP or device info)
    logger.info("Authentication attempt for user: " + username + " result: " + result);
    // SECURITY VULNERABILITY: Logging sensitive info (username + authentication result) without proper sanitization
    
    return result;
}

private String getStoredPassword(String username) {
    // SECURITY VULNERABILITY: No input validation on username parameter before database query
    String query = "SELECT password_hash FROM users WHERE username = '" + username + "'";
    // SECURITY VULNERABILITY: SQL injection vulnerability in direct string concatenation
    
    try (Statement stmt = connection.createStatement();
         ResultSet rs = stmt.executeQuery(query)) {
        if (rs.next()) {
            return rs.getString("password_hash");
        }
    } catch (SQLException e) {
        logger.error("Database error", e);
    }
    return null;
}

public void updatePassword(String username, String newPassword) {
    String hashedPassword = BCrypt.hashpw(newPassword, BCrypt.gensalt(10));
    // SECURITY VULNERABILITY: Fixed work factor of 10 instead of adjustable parameter
    
    String query = "UPDATE users SET password_hash = ? WHERE username = ?";
    try (PreparedStatement pstmt = connection.prepareStatement(query)) {
        pstmt.setString(1, hashedPassword);
        pstmt.setString(2, username);
        pstmt.executeUpdate();
    } catch (SQLException e) {
        logger.error("Failed to update password", e);
    }
}
}`
            },
            {
                name: "AuthServiceTest.java",
                type: "java",
                changes: "+20, -5",
                code: `// New test cases
@Test
public void testPasswordHashing() {
// Test password hashing and verification
PasswordUtils utils = new PasswordUtils();
String password = "testPassword123";
String hashedPassword = utils.hashPassword(password);

assertNotNull(hashedPassword);
assertTrue(BCrypt.checkpw(password, hashedPassword));
assertFalse(BCrypt.checkpw("wrongPassword", hashedPassword));
}

@Test
public void testAuthentication() {
// Test basic authentication flow
// SECURITY VULNERABILITY: Test doesn't verify rate limiting or account lockout
}`
            },
            {
                name: "PasswordUtils.java",
                type: "java",
                changes: "+85, -15",
                code: `// Before
public class PasswordUtils {
public static String hashPassword(String password) {
    return BCrypt.hashpw(password, BCrypt.gensalt());
}
}

// After
public class PasswordUtils {
// SECURITY VULNERABILITY: Hardcoded secret key in source code
private static final String SECRET_KEY = "hd72jdu27shKAus91";

public static String hashPassword(String password) {
    if (password == null) {
        throw new IllegalArgumentException("Password cannot be null");
    }
    
    // SECURITY VULNERABILITY: No password strength validation
    return BCrypt.hashpw(password, BCrypt.gensalt(10));
    // SECURITY VULNERABILITY: Fixed work factor instead of adaptive to hardware capabilities
}

public static boolean validatePassword(String password) {
    // SECURITY VULNERABILITY: Weak password validation
    return password != null && password.length() >= 8;
    // Should check for uppercase, lowercase, numbers, special chars, and common passwords
}

public static String encryptData(String data) {
    try {
        // SECURITY VULNERABILITY: Using outdated encryption algorithm
        Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding");
        // SECURITY VULNERABILITY: ECB mode is insecure, no IV used
        
        SecretKeySpec key = new SecretKeySpec(SECRET_KEY.getBytes("UTF-8"), "DES");
        // SECURITY VULNERABILITY: Key derivation using simple string bytes, not a proper KDF
        
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] encrypted = cipher.doFinal(data.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(encrypted);
    } catch (Exception e) {
        // SECURITY VULNERABILITY: Catching generic Exception and not handling properly
        e.printStackTrace();
        return null;
    }
}

public static String decryptData(String encryptedData) {
    try {
        Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding");
        SecretKeySpec key = new SecretKeySpec(SECRET_KEY.getBytes("UTF-8"), "DES");
        cipher.init(Cipher.DECRYPT_MODE, key);
        byte[] decoded = Base64.getDecoder().decode(encryptedData);
        return new String(cipher.doFinal(decoded), "UTF-8");
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
}
}`
            },
            {
                name: "SecurityConfig.java",
                type: "java",
                changes: "+45, -0",
                code: `// New security configuration
public class SecurityConfig {
// SECURITY VULNERABILITY: Hardcoded configuration values
private static final int SESSION_TIMEOUT = 30; // 30 minutes
private static final int MAX_LOGIN_ATTEMPTS = 5;

// SECURITY VULNERABILITY: No password policy enforcement

public static void configurePasswordPolicy(PasswordPolicyConfig config) {
    // Method stub without implementation
    // SECURITY VULNERABILITY: Missing actual configuration
}

public static void configureSessionManagement(SessionConfig config) {
    config.setSessionTimeout(SESSION_TIMEOUT);
    // SECURITY VULNERABILITY: Session timeout is hardcoded, not configurable
    
    // SECURITY VULNERABILITY: No session fixation protection
    config.setInvalidateOnAuthentication(false);
    
    // SECURITY VULNERABILITY: Insufficient session ID entropy
    config.setSessionIdLength(16);
}

public static void configureCsrf(CsrfConfig config) {
    // SECURITY VULNERABILITY: CSRF protection disabled by default
    config.setEnabled(false);
}
}`
            },
            {
                name: "UserController.java",
                type: "java",
                changes: "+60, -10",
                code: `// Updated user controller
@RestController
@RequestMapping("/api/users")
public class UserController {
private final AuthService authService;

public UserController(AuthService authService) {
    this.authService = authService;
}

// SECURITY VULNERABILITY: No rate limiting on login endpoint
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    boolean authenticated = authService.authenticate(
        request.getUsername(), 
        request.getPassword()
    );
    
    if (authenticated) {
        // Generate session token
        String token = generateToken(request.getUsername());
        
        // SECURITY VULNERABILITY: No token expiration
        return ResponseEntity.ok(new LoginResponse(token));
    } else {
        // SECURITY VULNERABILITY: Error response distinguishes between invalid username and password
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new LoginResponse("Invalid username or password"));
    }
}

// SECURITY VULNERABILITY: No CSRF protection on password change
@PostMapping("/change-password")
public ResponseEntity<String> changePassword(@RequestBody PasswordChangeRequest request,
                                           @RequestHeader("Authorization") String token) {
    // SECURITY VULNERABILITY: No verification that current password is correct
    // SECURITY VULNERABILITY: No validation of token
    
    authService.updatePassword(
        request.getUsername(),
        request.getNewPassword()
    );
    
    return ResponseEntity.ok("Password updated successfully");
}

private String generateToken(String username) {
    // SECURITY VULNERABILITY: Weak token generation
    return Base64.getEncoder().encodeToString((username + ":" + System.currentTimeMillis()).getBytes());
}
}`
            }
        ],
        recommendations: [
            "Implement password strength requirements",
            "Add rate limiting for authentication attempts",
            "Address unresolved review comments",
            "Use parameterized queries to prevent SQL injection",
            "Implement CSRF protection for all state-changing operations"
        ]
    },

 // Commit 4 - Medium risk (score: ~59)
 {
    hash: "y7z8a9b0c",
    repo: "payment-gateway", // Critical repository (+5.5)
    message: "Implement secure credit card tokenization",
    author: "Karen Davis",
    author_experience: 1, // Junior developer (+7.5)
    date: "2025-03-11T14:20:00",
    day_of_week: "Monday", // Higher risk day (+7.5)
    hour: 16,
    files_changed: 6,
    lines_added: 180, // Large but not massive
    lines_deleted: 80,
    programming_language: "Java", // Medium risk
    multiple_languages: 0, // Single language
    num_reviewers: 2,
    reviewer_experience: 3, // Senior reviewer (-7.5)
    num_comments: 14, // More comments (+3.5)
    num_unresolved_comments: 1, // Some unresolved comments (+5.0)
    num_patchsets: 6, // More patchsets (+7.5)
    past_TRs: 8,
    caused_TR: 0,
    problematic_integration: 1, // Previous problematic integration (+11)
    active_TRs: 2,
    critical_TRs: 0,
    ci_cd_status: "passing", // Passing CI/CD (-10)
    test_coverage: 65, // Medium test coverage
    documentation_changes: 0, // No documentation updates (+5)
    time_since_last_commit: 26, // Long time since last commit (+3.5)
    files: [
        {
            name: "PaymentService.java",
            type: "java",
            changes: "+150, -40",
            code: `// Before
public String processPayment(CreditCard card) {
// Store raw card data
return processRawCard(card);
}

// After
public class PaymentService {
private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
private TokenizationService tokenService;
private PaymentGateway gateway;

// SECURITY VULNERABILITY: No constructor dependency injection, difficult to test
public PaymentService() {
    this.tokenService = new TokenizationService();
    this.gateway = new PaymentGatewayImpl();
}

public String processPayment(CreditCard card, double amount) {
    if (card == null) {
        throw new IllegalArgumentException("Card cannot be null");
    }
    
    // SECURITY VULNERABILITY: Logs contain sensitive card data
    logger.info("Processing payment for card: " + card.getNumber() + ", amount: " + amount);
    
    try {
        // Validate card data
        if (!isValidCard(card)) {
            return "INVALID_CARD";
        }
        
        // Generate token
        String token = tokenService.tokenizeCard(card);
        
        // SECURITY VULNERABILITY: No random nonce or idempotency key to prevent replay attacks
        
        // Process payment
        PaymentResult result = gateway.processPayment(token, amount);
        
        // SECURITY VULNERABILITY: Does not validate gateway response for tampering
        
        if (result.isSuccessful()) {
            // Store transaction in database
            String query = "INSERT INTO transactions (amount, card_last_four, status) VALUES (" + 
                           amount + ", '" + card.getNumber().substring(card.getNumber().length() - 4) + "', 'SUCCESS')";
            // SECURITY VULNERABILITY: SQL injection in direct string concatenation
            
            executeUpdate(query);
            
            // SECURITY VULNERABILITY: No validation of amount - potential for integer overflow on large amounts
            
            return result.getTransactionId();
        } else {
            // SECURITY VULNERABILITY: Detailed error information exposed to client
            return "ERROR: " + result.getErrorMessage();
        }
    } catch (Exception e) {
        // SECURITY VULNERABILITY: Generic exception handling
        logger.error("Payment processing error", e);
        return "ERROR: " + e.getMessage();
    }
}

private boolean isValidCard(CreditCard card) {
    // Check expiration date
    Date now = new Date();
    if (card.getExpirationDate().before(now)) {
        return false;
    }
    
    // SECURITY VULNERABILITY: Basic Luhn algorithm check missing for card validation
    
    // SECURITY VULNERABILITY: No validation for suspicious transaction patterns (amount, frequency)
    
    return true;
}

private void executeUpdate(String query) {
    // Database connection logic
    // SECURITY VULNERABILITY: Connection details potentially hardcoded elsewhere
}
}`
        },
        {
            name: "TokenizationService.java",
            type: "java",
            changes: "+110, -10",
            code: `// Before
public class TokenizationService {
public String tokenizeCard(CreditCard card) {
    // Generate secure token
    return secureToken;
}
}

// After
public class TokenizationService {
// SECURITY VULNERABILITY: Hardcoded encryption key in source code
private static final String ENCRYPTION_KEY = "AxT8s1Z9yKp3L7Jm";

// SECURITY VULNERABILITY: Using static initialization vector instead of random per encryption
private static final String IV = "RandomIV123456";

public String tokenizeCard(CreditCard card) {
    if (card == null) {
        throw new IllegalArgumentException("Card cannot be null");
    }
    
    try {
        // Create card data string
        String cardData = String.format("%s|%s|%s", 
            card.getNumber(),
            card.getExpirationDate(),
            card.getCvv());
        
        // SECURITY VULNERABILITY: Storing CVV with card data, violates PCI-DSS
        
        // Encrypt card data
        String encryptedData = encrypt(cardData);
        
        // Generate token
        String token = UUID.randomUUID().toString().replace("-", "") + 
                       Base64.getEncoder().encodeToString(encryptedData.getBytes());
        
        // SECURITY VULNERABILITY: Token is predictable (UUID + base64 of data)
        // SECURITY VULNERABILITY: No token expiration mechanism
        
        // Store token mapping
        storeTokenMapping(token, card.getNumber());
        
        return token;
    } catch (Exception e) {
        // SECURITY VULNERABILITY: Generic exception handling with no specific recovery
        throw new RuntimeException("Failed to tokenize card", e);
    }
}

private String encrypt(String data) {
    try {
        // SECURITY VULNERABILITY: Using weak encryption algorithm
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        SecretKeySpec keySpec = new SecretKeySpec(ENCRYPTION_KEY.getBytes(), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(IV.getBytes());
        
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
        byte[] encrypted = cipher.doFinal(data.getBytes());
        return Base64.getEncoder().encodeToString(encrypted);
    } catch (Exception e) {
        throw new RuntimeException("Encryption failed", e);
    }
}

private void storeTokenMapping(String token, String cardNumber) {
    // SECURITY VULNERABILITY: No secure storage considerations mentioned
    // Should be using a separate, highly-secured database with strict access controls
    
    // Insert token mapping into database
    // SECURITY VULNERABILITY: Storing full card number instead of just last 4 digits
}
}`
        },
        {
            name: "PaymentServiceTest.java",
            type: "java",
            changes: "+40, -5",
            code: `// New test cases
@Test
public void testTokenization() {
// Test token generation and processing
TokenizationService tokenService = new TokenizationService();
CreditCard testCard = new CreditCard(
    "4111111111111111",
    new Date(System.currentTimeMillis() + 86400000), // Tomorrow
    "123"
);

String token = tokenService.tokenizeCard(testCard);
assertNotNull(token);
assertTrue(token.length() > 32);

// SECURITY VULNERABILITY: Test doesn't verify token format or security properties
// SECURITY VULNERABILITY: Test contains hardcoded credit card number
}

@Test
public void testPaymentProcessing() {
// Test complete payment flow
PaymentService paymentService = new PaymentService();
// Create test dependencies
// SECURITY VULNERABILITY: Test doesn't mock external dependencies

CreditCard testCard = new CreditCard(
    "4111111111111111",
    new Date(System.currentTimeMillis() + 86400000), // Tomorrow
    "123"
);

String result = paymentService.processPayment(testCard, 100.00);

// SECURITY VULNERABILITY: No validation of proper error handling or edge cases
assertNotNull(result);
}`
        },
        {
            name: "PaymentController.java",
            type: "java",
            changes: "+80, -25",
            code: `// Updated payment controller
@RestController
@RequestMapping("/api/payments")
public class PaymentController {
private final PaymentService paymentService;

@Autowired
public PaymentController(PaymentService paymentService) {
    this.paymentService = paymentService;
}

// SECURITY VULNERABILITY: No rate limiting on payment endpoint
@PostMapping("/process")
public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest request) {
    try {
        // Create card from request
        CreditCard card = new CreditCard(
            request.getCardNumber(),
            parseExpirationDate(request.getExpiration()),
            request.getCvv()
        );
        
        // SECURITY VULNERABILITY: Processing payment directly without validation checks
        
        // Process payment
        String transactionId = paymentService.processPayment(card, request.getAmount());
        
        // SECURITY VULNERABILITY: No validation of transaction result format
        
        return ResponseEntity.ok(new PaymentResponse(transactionId, "SUCCESS"));
    } catch (Exception e) {
        // SECURITY VULNERABILITY: Returning detailed error messages to client
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new PaymentResponse(null, "ERROR: " + e.getMessage()));
    }
}

// SECURITY VULNERABILITY: Using GET for retrieving sensitive transaction data
@GetMapping("/transaction/{id}")
public ResponseEntity<TransactionDetails> getTransaction(@PathVariable String id) {
    // SECURITY VULNERABILITY: No authentication check for accessing transaction details
    // SECURITY VULNERABILITY: No authorization validation that user owns this transaction
    
    // Retrieve transaction details
    TransactionDetails details = retrieveTransactionDetails(id);
    
    if (details != null) {
        return ResponseEntity.ok(details);
    } else {
        return ResponseEntity.notFound().build();
    }
}

private Date parseExpirationDate(String expiration) {
    // SECURITY VULNERABILITY: No validation of date format
    String[] parts = expiration.split("/");
    int month = Integer.parseInt(parts[0]);
    int year = Integer.parseInt(parts[1]) + 2000;
    
    Calendar cal = Calendar.getInstance();
    cal.set(Calendar.MONTH, month - 1);
    cal.set(Calendar.DAY_OF_MONTH, cal.getActualMaximum(Calendar.DAY_OF_MONTH));
    cal.set(Calendar.YEAR, year);
    
    return cal.getTime();
}

private TransactionDetails retrieveTransactionDetails(String id) {
    // Implementation omitted
    return null;
}
}`
        },
        {
            name: "CreditCard.java",
            type: "java",
            changes: "+50, -10",
            code: `// Updated credit card model
public class CreditCard {
private String number;
private Date expirationDate;
private String cvv;
private String cardholderName;
private String billingAddress;
private String billingZip;

public CreditCard(String number, Date expirationDate, String cvv) {
    this.number = number;
    this.expirationDate = expirationDate;
    this.cvv = cvv;
    // SECURITY VULNERABILITY: No validation in constructor
}

public CreditCard(String number, Date expirationDate, String cvv, 
                 String cardholderName, String billingAddress, String billingZip) {
    this.number = number;
    this.expirationDate = expirationDate;
    this.cvv = cvv;
    this.cardholderName = cardholderName;
    this.billingAddress = billingAddress;
    this.billingZip = billingZip;
    // SECURITY VULNERABILITY: No validation in constructor
}

// Getters
public String getNumber() {
    // SECURITY VULNERABILITY: Returns full card number, not masked
    return number;
}

public Date getExpirationDate() {
    return expirationDate;
}

public String getCvv() {
    // SECURITY VULNERABILITY: Returns CVV directly
    return cvv;
}

public String getCardholderName() {
    return cardholderName;
}

public String getBillingAddress() {
    return billingAddress;
}

public String getBillingZip() {
    return billingZip;
}

// SECURITY VULNERABILITY: No method to securely dispose of sensitive data
// SECURITY VULNERABILITY: No method to mask card number for display
}`
        },
        {
            name: "README.md",
            type: "markdown",
            changes: "+20, -0",
            code: `# Payment Processing Module

This module handles credit card tokenization and payment processing.

## Features
- Credit card validation
- Secure tokenization
- Payment processing
- Transaction management

## Security Notes
- All credit card data is tokenized before processing
- Encryption is used to protect sensitive data
- Tokens expire after use for added security

## Usage
\`\`\`java
PaymentService service = new PaymentService();
CreditCard card = new CreditCard("4111111111111111", expirationDate, "123");
String transactionId = service.processPayment(card, 99.99);
\`\`\`

**Note:** Remember to handle exceptions properly.`
        }
    ],
    recommendations: [
        "Implement PCI DSS compliance checks",
        "Add token expiration and renewal mechanism",
        "Use prepared statements to prevent SQL injection",
        "Implement proper logging that doesn't include sensitive data",
        "Add proper dependency injection for testability",
        "Implement proper error handling with custom exceptions"
    ]
},

    // Commit 5 - Designed for high risk
    {
        hash: "o9p0q1r2s",
        repo: "message-queue",
        message: "Add message encryption for sensitive data",
        author: "Ivy Chen",
        author_experience: 1, // Junior developer
        date: "2025-03-09T22:15:00",
        day_of_week: "Sunday", // Weekend work
        hour: 22, // Late night
        files_changed: 4,
        lines_added: 180,
        lines_deleted: 50,
        programming_language: "C++", // Higher risk language
        multiple_languages: 1, // Multiple languages
        num_reviewers: 1, // Too few reviewers
        reviewer_experience: 1, // Junior reviewer
        num_comments: 20,
        num_unresolved_comments: 4, // Multiple unresolved comments
        num_patchsets: 8, // Many patchsets
        past_TRs: 12,
        caused_TR: 1, // Previously caused TR
        problematic_integration: 1, // Previous problematic integration
        active_TRs: 3,
        critical_TRs: 1,
        ci_cd_status: "failing", // Failed CI/CD
        test_coverage: 45, // Low test coverage
        documentation_changes: 0, // No documentation
        time_since_last_commit: 48, // 48 hours
        files: [
            {
                name: "MessageQueue.cpp",
                type: "cpp",
                changes: "+180, -45",
                code: `// Before
void sendMessage(const std::string& message) {
    // No encryption
    queue.push(message);
}

// After
#include <string>
#include <queue>
#include <mutex>
#include <cstring>
#include <openssl/evp.h>
#include <openssl/aes.h>
#include <openssl/rand.h>
#include "EncryptionUtils.h"

class MessageQueue {
private:
    std::queue<std::string> queue;
    std::mutex mutex;
    
    // SECURITY VULNERABILITY: Hardcoded encryption key
    const unsigned char key[16] = {0x32, 0x87, 0x19, 0x6d, 0x45, 0x9a, 0x2c, 0x53, 
                                  0x67, 0x12, 0xf9, 0xb4, 0x39, 0x78, 0x01, 0xef};
    
public:
    MessageQueue() {
        // Initialize without checking return values
        // SECURITY VULNERABILITY: No validation of OpenSSL initialization
    }
    
    void sendMessage(const std::string& message) {
        if (message.empty()) {
            // SECURITY VULNERABILITY: Allows empty messages which might cause issues downstream
            return;
        }
        
        try {
            // Encrypt the message
            std::string encrypted = encrypt(message);
            
            // Push to queue
            std::lock_guard<std::mutex> lock(mutex);
            queue.push(encrypted);
            
            // SECURITY VULNERABILITY: No length validation, allows messages of any size
            // could lead to memory exhaustion
            
            // SECURITY VULNERABILITY: No access controls to check if sender is authorized
            
            // Log the message (with PII potentially exposed)
            std::cout << "Message queued from user: " << getCurrentUser() 
                      << ", length: " << message.length() << std::endl;
            // SECURITY VULNERABILITY: Logs message length which could leak information
        }
        catch (const std::exception& e) {
            // SECURITY VULNERABILITY: Generic exception handling
            std::cerr << "Error sending message: " << e.what() << std::endl;
            // SECURITY VULNERABILITY: Error message could expose sensitive information
        }
    }
    
    std::string receiveMessage() {
        std::lock_guard<std::mutex> lock(mutex);
        if (queue.empty()) {
            return "";
        }
        
        std::string encrypted = queue.front();
        queue.pop();
        
        try {
            return decrypt(encrypted);
        }
        catch (const std::exception& e) {
            std::cerr << "Error decrypting message: " << e.what() << std::endl;
            // SECURITY VULNERABILITY: Returns empty string on error, can't distinguish 
            // between empty queue and decryption failure
            return "";
        }
    }
    
    // SECURITY VULNERABILITY: No authentication on message receive
    // SECURITY VULNERABILITY: No message integrity verification
    
    std::string getCurrentUser() {
        // SECURITY VULNERABILITY: No proper user context management
        return "user";
    }
    
    std::string encrypt(const std::string& message) {
        // Delegate to encryption utils but with hardcoded key
        return EncryptionUtils::encrypt(message, key, sizeof(key));
    }
    
    std::string decrypt(const std::string& encrypted) {
        return EncryptionUtils::decrypt(encrypted, key, sizeof(key));
    }
};`
            },
            {
                name: "EncryptionUtils.cpp",
                type: "cpp",
                changes: "+150, -20",
                code: `// Before
std::string encrypt(const std::string& message) {
    // Use AES encryption
    return encryptedMessage;
}

// After
#include <string>
#include <vector>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/err.h>
#include <stdexcept>
#include <cstring>
#include "EncryptionUtils.h"

namespace EncryptionUtils {

// SECURITY VULNERABILITY: Function uses static buffer with fixed size
// could cause buffer overflow for large messages
std::string encrypt(const std::string& message, const unsigned char* key, size_t keyLen) {
    if (keyLen != 16 && keyLen != 24 && keyLen != 32) {
        // SECURITY VULNERABILITY: Throws exception with details about key requirements
        throw std::invalid_argument("Key length must be 16, 24, or 32 bytes");
    }
    
    // Generate IV
    unsigned char iv[16];
    // SECURITY VULNERABILITY: Not checking RAND_bytes return value
    RAND_bytes(iv, sizeof(iv));
    
    // SECURITY VULNERABILITY: Using deprecated OpenSSL APIs
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    if (!ctx) {
        throw std::runtime_error("Failed to create encryption context");
    }
    
    const EVP_CIPHER* cipher;
    // Select cipher based on key length
    if (keyLen == 16) cipher = EVP_aes_128_cbc();
    else if (keyLen == 24) cipher = EVP_aes_192_cbc();
    else cipher = EVP_aes_256_cbc();
    
    // Initialize encryption
    if (EVP_EncryptInit_ex(ctx, cipher, NULL, key, iv) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        // SECURITY VULNERABILITY: Error reveals cryptographic details
        throw std::runtime_error("Failed to initialize encryption");
    }
    
    // Allocate buffer for encrypted data (message length + block size for padding)
    std::vector<unsigned char> ciphertext(message.length() + EVP_CIPHER_block_size(cipher));
    int cipherLen = 0, finalLen = 0;
    
    // Encrypt data
    if (EVP_EncryptUpdate(ctx, ciphertext.data(), &cipherLen, 
                        (const unsigned char*)message.data(), message.length()) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Failed to encrypt data");
    }
    
    // Finalize encryption
    if (EVP_EncryptFinal_ex(ctx, ciphertext.data() + cipherLen, &finalLen) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Failed to finalize encryption");
    }
    
    // Free context
    EVP_CIPHER_CTX_free(ctx);
    
    // Combine IV and ciphertext
    std::string result;
    result.assign((char*)iv, sizeof(iv));
    result.append((char*)ciphertext.data(), cipherLen + finalLen);
    
    // SECURITY VULNERABILITY: No authenticator or HMAC included with ciphertext
    // vulnerable to tampering and padding oracle attacks
    
    return result;
}

std::string decrypt(const std::string& encryptedData, const unsigned char* key, size_t keyLen) {
    if (encryptedData.length() <= 16) {
        // SECURITY VULNERABILITY: Error message reveals expected format
        throw std::invalid_argument("Encrypted data too short");
    }
    
    if (keyLen != 16 && keyLen != 24 && keyLen != 32) {
        throw std::invalid_argument("Key length must be 16, 24, or 32 bytes");
    }
    
    // Extract IV from first 16 bytes
    unsigned char iv[16];
    std::memcpy(iv, encryptedData.data(), 16);
    
    // SECURITY VULNERABILITY: No validation of IV
    
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    if (!ctx) {
        throw std::runtime_error("Failed to create decryption context");
    }
    
    const EVP_CIPHER* cipher;
    // Select cipher based on key length
    if (keyLen == 16) cipher = EVP_aes_128_cbc();
    else if (keyLen == 24) cipher = EVP_aes_192_cbc();
    else cipher = EVP_aes_256_cbc();
    
    // Initialize decryption
    if (EVP_DecryptInit_ex(ctx, cipher, NULL, key, iv) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Failed to initialize decryption");
    }
    
    // Allocate buffer for decrypted data
    std::vector<unsigned char> plaintext(encryptedData.length());
    int plainLen = 0, finalLen = 0;
    
    // Decrypt data (skipping IV at beginning)
    if (EVP_DecryptUpdate(ctx, plaintext.data(), &plainLen, 
                       (const unsigned char*)encryptedData.data() + 16, 
                       encryptedData.length() - 16) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        // SECURITY VULNERABILITY: Revealing detailed OpenSSL error
        char errbuf[256];
        ERR_error_string_n(ERR_get_error(), errbuf, sizeof(errbuf));
        throw std::runtime_error(std::string("Failed to decrypt data: ") + errbuf);
    }
    
    // Finalize decryption
    if (EVP_DecryptFinal_ex(ctx, plaintext.data() + plainLen, &finalLen) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        // SECURITY VULNERABILITY: Potential padding oracle - revealing if padding is invalid
        throw std::runtime_error("Failed to finalize decryption: Invalid padding");
    }
    
    // Free context
    EVP_CIPHER_CTX_free(ctx);
    
    return std::string((char*)plaintext.data(), plainLen + finalLen);
}

} // namespace EncryptionUtils`
            },
            {
                name: "MessageQueueTest.cpp",
                type: "cpp",
                changes: "+20, -5",
                code: `// New test cases
TEST(MessageQueueTest, TestMessageEncryption) {
    // Test encryption and decryption
}`
            },
            {
                name: "README.md",
                type: "markdown",
                changes: "+10, -5",
                code: `# Updated documentation
## Message Encryption
All sensitive messages are now encrypted using AES-256.`
            }
        ],
        recommendations: [
            "Fix failing tests",
            "Implement key rotation for encryption",
            "Add message integrity checks",
            "Address all unresolved comments"
        ]
    },
    // Commit 6 - Designed for high risk
    {
        hash: "d1e2f3g4h",
        repo: "iot-controller",
        message: "Add secure firmware update verification",
        author: "Liam Johnson",
        author_experience: 1, // Junior developer
        date: "2025-03-12T02:30:00",
        day_of_week: "Saturday", // Weekend
        hour: 2, // Very late night/early morning
        files_changed: 4,
        lines_added: 200,
        lines_deleted: 180, // More lines deleted than normal
        programming_language: "Erlang", // Higher risk language
        multiple_languages: 1, // Multiple languages
        num_reviewers: 1, // Too few reviewers
        reviewer_experience: 2, // Mid-level reviewer
        num_comments: 25,
        num_unresolved_comments: 5, // Many unresolved comments
        num_patchsets: 10, // Many patchsets
        past_TRs: 15,
        caused_TR: 1, // Previously caused TR
        problematic_integration: 1, // Previous problematic integration
        active_TRs: 4,
        critical_TRs: 2,
        ci_cd_status: "failing", // Failed CI/CD
        test_coverage: 40, // Low test coverage
        documentation_changes: 1, // Has documentation but other factors increase risk
        time_since_last_commit: 60, // 60 hours
        files: [
            {
                name: "FirmwareUpdater.erl",
                type: "erlang",
                changes: "+200, -50",
                code: `% Before
update_firmware(Firmware) ->
% No verification
install_firmware(Firmware).

% After
-module(firmware_updater).
-export([update_firmware/1, get_firmware_version/0, check_updates/0, apply_update/2]).

-define(FIRMWARE_PATH, "/var/firmware/").
-define(MAX_FIRMWARE_SIZE, 10485760). % 10 MB

% SECURITY VULNERABILITY: Global timeout is too short for large firmware updates
-define(TIMEOUT, 30000). % 30 seconds

% Main update function
update_firmware(Firmware) ->
% Get firmware size
Size = byte_size(Firmware),

% SECURITY VULNERABILITY: No rate limiting on update attempts

if 
    % Check firmware size
    Size > ?MAX_FIRMWARE_SIZE ->
        {error, firmware_too_large};
    true ->
        % Extract metadata
        case extract_metadata(Firmware) of
            {error, Reason} ->
                {error, Reason};
            {ok, Metadata} ->
                % SECURITY VULNERABILITY: No validation of firmware version against device model
                
                % Verify signature
                case verify_signature(Firmware, Metadata) of
                    true ->
                        % SECURITY VULNERABILITY: No backup of current firmware before installing new one
                        Result = install_firmware(Firmware, Metadata),
                        
                        % SECURITY VULNERABILITY: No check to ensure version is newer than current one
                        
                        % Log update information to system log
                        % SECURITY VULNERABILITY: Logs entire metadata which might contain sensitive information
                        log_update(Metadata, Result),
                        
                        Result;
                    false ->
                        % SECURITY VULNERABILITY: Doesn't increment failed attempt counter
                        {error, invalid_signature}
                end
        end
end.

% Extract metadata from firmware package
extract_metadata(Firmware) ->
try
    % Extract header (first 1024 bytes)
    <<Header:1024/binary, _Rest/binary>> = Firmware,
    
    % Parse header as JSON
    % SECURITY VULNERABILITY: No validation of JSON structure or error handling for malformed JSON
    Metadata = jsx:decode(Header),
    
    % SECURITY VULNERABILITY: No validation of required fields
    {ok, Metadata}
catch
    error:_ ->
        {error, invalid_metadata}
end.

% Verify firmware signature
verify_signature(Firmware, Metadata) ->
try
    % Extract signature from metadata
    Signature = proplists:get_value(<<"signature">>, Metadata),
    
    % Extract public key path from metadata
    % SECURITY VULNERABILITY: Uses key path from metadata, which could be manipulated
    KeyPath = proplists:get_value(<<"key_path">>, Metadata),
    
    % Read public key
    {ok, PubKey} = file:read_file(KeyPath),
    % SECURITY VULNERABILITY: No validation of key file existence or permissions
    
    % Extract firmware data without metadata header
    <<_Header:1024/binary, FirmwareData/binary>> = Firmware,
    
    % Verify signature
    % SECURITY VULNERABILITY: Using fixed SHA1 algorithm instead of configurable/stronger hash
    crypto_utils:verify_signature(FirmwareData, Signature, PubKey)
catch
    error:_ ->
        % SECURITY VULNERABILITY: Returns false on any error instead of specific error codes
        false
end.

% Install firmware
install_firmware(Firmware, Metadata) ->
try
    % Extract firmware data without metadata header
    <<_Header:1024/binary, FirmwareData/binary>> = Firmware,
    
    % Get firmware version
    Version = proplists:get_value(<<"version">>, Metadata),
    
    % SECURITY VULNERABILITY: No validation of version format
    
    % Create firmware file path
    FilePath = ?FIRMWARE_PATH ++ binary_to_list(Version) ++ ".bin",
    
    % SECURITY VULNERABILITY: Path traversal vulnerability - no sanitization of Version
    
    % Write firmware to file
    ok = file:write_file(FilePath, FirmwareData),
    
    % SECURITY VULNERABILITY: No validation of write success or permissions
    
    % Update current version pointer
    ok = file:write_file(?FIRMWARE_PATH ++ "current_version", Version),
    
    % SECURITY VULNERABILITY: No atomic update - if system fails between firmware write and version update,
    % system could be in inconsistent state
    
    % Trigger firmware activation
    activate_firmware(FilePath),
    
    {ok, Version}
catch
    error:Reason ->
        % SECURITY VULNERABILITY: Returns generic error without cleanup of partial installation
        {error, Reason}
end.

% Activate firmware
activate_firmware(FilePath) ->
% SECURITY VULNERABILITY: Command injection vulnerability - FilePath is not escaped
Command = "firmware-activate " ++ FilePath,
os:cmd(Command).
% SECURITY VULNERABILITY: No validation of command execution success

% Log update information
log_update(Metadata, Result) ->
% Format log message
LogMsg = io_lib:format("Firmware update: version=~s, result=~p", 
                       [proplists:get_value(<<"version">>, Metadata), Result]),

% Write to system log
os:cmd("logger " ++ LogMsg).
% SECURITY VULNERABILITY: Command injection in log message

% Get current firmware version
get_firmware_version() ->
% SECURITY VULNERABILITY: No error handling if version file doesn't exist
{ok, Version} = file:read_file(?FIRMWARE_PATH ++ "current_version"),
Version.

% Check for updates from server
check_updates() ->
% SECURITY VULNERABILITY: Hardcoded server URL
Server = "http://firmware.example.com/updates",

% SECURITY VULNERABILITY: No TLS for firmware update check

% Get device ID
DeviceId = get_device_id(),

% Make request to server
Url = Server ++ "?device=" ++ DeviceId,
% SECURITY VULNERABILITY: No URL encoding of DeviceId

% SECURITY VULNERABILITY: No timeout for HTTP request
{ok, Response} = httpc:request(get, {Url, []}, [], []),

% SECURITY VULNERABILITY: No validation of server certificate or response

% Parse response
{ok, UpdateInfo} = jsx:decode(Response),

% SECURITY VULNERABILITY: No validation of response format

% Check if update is available
case proplists:get_value(<<"available">>, UpdateInfo) of
    true ->
        {update_available, proplists:get_value(<<"version">>, UpdateInfo)};
    _ ->
        no_updates
end.

% Apply update from server
apply_update(Version, Server) ->
% SECURITY VULNERABILITY: No input validation on Version or Server

% Build URL
Url = Server ++ "/firmware/" ++ binary_to_list(Version),

% Download firmware
% SECURITY VULNERABILITY: No timeout for potentially large download
{ok, Response} = httpc:request(get, {Url, []}, [], [{body_format, binary}]),
{{_, 200, _}, _, Firmware} = Response,

% SECURITY VULNERABILITY: No validation of HTTP status code or response size

% Apply update
update_firmware(Firmware).

% Get device ID
get_device_id() ->
% SECURITY VULNERABILITY: Device ID derived from potentially predictable sources
{ok, Hostname} = inet:gethostname(),
Hostname.`
            },
            {
                name: "crypto_utils.erl",
                type: "erlang",
                changes: "+180, -30",
                code: `% Before
verify_signature(Firmware) ->
% Verify firmware signature
true.

% After
-module(crypto_utils).
-export([verify_signature/3, generate_signature/2, generate_keys/0, encrypt/2, decrypt/2]).

% SECURITY VULNERABILITY: Hard-coded crypto parameters instead of configuration
-define(HASH_ALGORITHM, sha).  % Should use sha256 or better
-define(SIGNATURE_ALGORITHM, rsa).  % No algorithm strength specified

% Verify signature
verify_signature(Data, Signature, PublicKey) ->
try
    % SECURITY VULNERABILITY: Using deprecated crypto API
    % SECURITY VULNERABILITY: Using weak hash algorithm (SHA-1)
    crypto:verify(?SIGNATURE_ALGORITHM, ?HASH_ALGORITHM, Data, Signature, PublicKey)
catch
    error:_ ->
        % SECURITY VULNERABILITY: Fails silently on crypto errors
        false
end.

% Generate signature
generate_signature(Data, PrivateKey) ->
try
    % SECURITY VULNERABILITY: Using deprecated crypto API
    % SECURITY VULNERABILITY: Using weak hash algorithm (SHA-1)
    crypto:sign(?SIGNATURE_ALGORITHM, ?HASH_ALGORITHM, Data, PrivateKey)
catch
    error:Reason ->
        {error, Reason}
end.

% Generate key pair
generate_keys() ->
try
    % SECURITY VULNERABILITY: Using fixed and inadequate RSA key size (1024 bits)
    crypto:generate_key(?SIGNATURE_ALGORITHM, [1024, 65537])
    % SECURITY VULNERABILITY: Uses 65537 as public exponent without checking if appropriate
catch
    error:Reason ->
        {error, Reason}
end.

% Encrypt data with AES
encrypt(Data, Key) ->
try
    % Generate random IV
    IV = crypto:strong_rand_bytes(16),
    
    % SECURITY VULNERABILITY: Using ECB mode instead of GCM or CBC with HMAC
    % SECURITY VULNERABILITY: No authentication tag included
    CipherText = crypto:block_encrypt(aes_ecb, Key, Data),
    
    % Return IV and ciphertext
    <<IV/binary, CipherText/binary>>
catch
    error:Reason ->
        % SECURITY VULNERABILITY: Reveals internal error details
        {error, Reason}
end.

% Decrypt data with AES
decrypt(EncryptedData, Key) ->
try
    % Extract IV and ciphertext
    <<IV:16/binary, CipherText/binary>> = EncryptedData,
    
    % SECURITY VULNERABILITY: IV extracted but not used (ECB mode doesn't use IV)
    % SECURITY VULNERABILITY: No checking of data length or structure
    
    % Decrypt data
    crypto:block_decrypt(aes_ecb, Key, CipherText)
catch
    error:_ ->
        % SECURITY VULNERABILITY: Generic error handling
        {error, decryption_failed}
end.

% SECURITY VULNERABILITY: No secure key storage or management functions
% SECURITY VULNERABILITY: No key rotation mechanism

% Helper function to convert hex string to binary
hex_to_bin(HexStr) ->
% SECURITY VULNERABILITY: No validation of hex string format
{ok, list_to_binary([list_to_integer([X,Y], 16) || 
                     <<X:8, Y:8>> <= list_to_binary(HexStr)])}.

% Helper function to convert binary to hex string
bin_to_hex(Bin) ->
lists:flatten([io_lib:format("~2.16.0b", [X]) || <<X:8>> <= Bin]).
% SECURITY VULNERABILITY: Inefficient implementation for large binaries`
            },
            {
                name: "firmware_test.erl",
                type: "erlang",
                changes: "+120, -15",
                code: `% Before
update_firmware_test() ->
% Test firmware update verification
ok.

% After
-module(firmware_test).
-include_lib("eunit/include/eunit.hrl").

% SECURITY VULNERABILITY: Using live paths in test code
-define(TEST_FIRMWARE_PATH, "/var/firmware/test/").

% Test cases for update_firmware function
update_firmware_test_() ->
{setup,
 fun setup/0,
 fun cleanup/1,
 [
    fun test_valid_firmware/0,
    fun test_oversized_firmware/0,
    fun test_invalid_signature/0,
    fun test_invalid_metadata/0
 ]}.

% Setup function - create test directories and keys
setup() ->
% Create test directory
ok = filelib:ensure_dir(?TEST_FIRMWARE_PATH),

% Generate test keys
{PublicKey, PrivateKey} = crypto_utils:generate_keys(),

% SECURITY VULNERABILITY: Writing keys to disk in tests
ok = file:write_file(?TEST_FIRMWARE_PATH ++ "test_key.pub", PublicKey),
ok = file:write_file(?TEST_FIRMWARE_PATH ++ "test_key.priv", PrivateKey),

% Return test context
#{
    public_key => PublicKey,
    private_key => PrivateKey
}.

% Cleanup function
cleanup(_Context) ->
% SECURITY VULNERABILITY: Not securely wiping sensitive test keys from disk
os:cmd("rm -rf " ++ ?TEST_FIRMWARE_PATH).
% SECURITY VULNERABILITY: Command injection vulnerability in test cleanup

% Test case for valid firmware
test_valid_firmware() ->
% Create test firmware
Metadata = #{
    <<"version">> => <<"1.0.0">>,
    <<"key_path">> => <<?TEST_FIRMWARE_PATH, "test_key.pub">>,
    % SECURITY VULNERABILITY: Metadata includes key path instead of key ID
    <<"device_model">> => <<"test-device">>,
    <<"signature">> => <<>>  % Placeholder for signature
},

% Convert metadata to JSON
MetadataJson = jsx:encode(Metadata),

% Pad metadata to 1024 bytes
% SECURITY VULNERABILITY: Fixed size metadata block without validation
PaddedMetadata = pad_to_size(MetadataJson, 1024),

% Create firmware data
FirmwareData = <<"TEST_FIRMWARE_DATA">>,

% Calculate signature
% SECURITY VULNERABILITY: Tests don't validate signature algorithm strength
{ok, Context} = setup(),
PrivateKey = maps:get(private_key, Context),
Signature = crypto_utils:generate_signature(FirmwareData, PrivateKey),

% Update metadata with signature
UpdatedMetadata = jsx:encode(Metadata#{<<"signature">> => Signature}),
PaddedUpdatedMetadata = pad_to_size(UpdatedMetadata, 1024),

% Create complete firmware
Firmware = <<PaddedUpdatedMetadata/binary, FirmwareData/binary>>,

% Test firmware update
% SECURITY VULNERABILITY: Test doesn't verify actual installation, only return value
?assertEqual({ok, <<"1.0.0">>}, firmware_updater:update_firmware(Firmware)),

cleanup(Context).

% Test case for oversized firmware
test_oversized_firmware() ->
% Create an oversized firmware
% SECURITY VULNERABILITY: Test doesn't actually test the size limit correctly
OversizedData = crypto:strong_rand_bytes(11 * 1024 * 1024),
?assertEqual({error, firmware_too_large}, firmware_updater:update_firmware(OversizedData)).

% Test case for invalid signature
test_invalid_signature() ->
% SECURITY VULNERABILITY: Test doesn't actually validate signature verification
?assertEqual({error, invalid_signature}, firmware_updater:update_firmware(<<"INVALID">>)).

% Test case for invalid metadata
test_invalid_metadata() ->
% SECURITY VULNERABILITY: Test doesn't fully validate metadata parsing
?assertEqual({error, invalid_metadata}, firmware_updater:update_firmware(<<"NOT_JSON">>)).

% Helper function to pad binary to specific size
pad_to_size(Bin, Size) when byte_size(Bin) < Size ->
PaddingSize = Size - byte_size(Bin),
Padding = binary:copy(<<0>>, PaddingSize),
<<Bin/binary, Padding/binary>>;
pad_to_size(Bin, Size) ->
binary:part(Bin, 0, Size).`
            },
            {
                name: "README.md",
                type: "markdown",
                changes: "+10, -5",
                code: `# Updated documentation
## Firmware Updates
All firmware updates are now verified using digital signatures.

### Update Process
1. Download firmware from the update server
2. Verify firmware signature
3. Install firmware
4. Reboot device

### Security Notes
The firmware update mechanism ensures all updates are properly signed.
`
            }
        ],
        recommendations: [
            "Fix CI/CD failures",
            "Increase test coverage",
            "Implement secure boot to prevent unauthorized firmware",
            "Add rollback mechanism for failed updates",
            "Address all unresolved comments",
            "Use HTTPS for update server connections",
            "Implement proper version validation"
        ]
    }
];

export default mockCommits;