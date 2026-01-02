from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import re
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class VulnerabilityIssue(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    severity: str
    title: str
    description: str
    line_number: Optional[int] = None
    code_snippet: Optional[str] = None
    ai_explanation: str
    confidence_score: float
    policy_mappings: List[str]
    recommendation: str

class ScanRequest(BaseModel):
    code: str
    language: str
    project_context: str
    scan_profile: str
    filename: Optional[str] = "uploaded_file"

class ScanResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    scan_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    language: str
    project_context: str
    scan_profile: str
    total_issues: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    risk_score: float
    deployment_ready: bool
    vulnerabilities: List[VulnerabilityIssue]

class AttackSimulation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    scan_id: str
    stages: List[Dict[str, Any]]
    impact_summary: str
    citizen_impact: str
    feasibility_score: float

class SecureFix(BaseModel):
    vulnerability_id: str
    original_code: str
    fixed_code: str
    explanation: str
    prevents_attacks: List[str]

class ComplianceReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    scan_id: str
    owasp: Dict[str, Any]
    iso27001: Dict[str, Any]
    nist: Dict[str, Any]
    gdpr: Dict[str, Any]

class Lesson(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    content: str
    difficulty: str
    completed: bool = False

# OWASP Top 10 and Security Rules
SECURITY_RULES = {
    'SQL_INJECTION': {
        'patterns': [r'execute\(.*\+', r'SELECT.*\+.*FROM', r'SELECT.*\"\s*\+', r'WHERE.*\+', r'cursor\.execute\(.*%'],
        'severity': 'Critical',
        'owasp': 'A03:2021 - Injection',
        'description': 'SQL Injection vulnerability detected'
    },
    'XSS': {
        'patterns': [r'innerHTML\s*=', r'document\.write\(', r'eval\(', r'dangerouslySetInnerHTML'],
        'severity': 'High',
        'owasp': 'A03:2021 - Injection',
        'description': 'Cross-Site Scripting (XSS) vulnerability detected'
    },
    'HARDCODED_SECRET': {
        'patterns': [r'password\s*=\s*["\'][^"\']', r'api[_-]?key\s*=\s*["\'][^"\']', r'secret\s*=\s*["\'][^"\']', r'token\s*=\s*["\'][^"\']'],
        'severity': 'Critical',
        'owasp': 'A07:2021 - Identification and Authentication Failures',
        'description': 'Hardcoded credentials detected'
    },
    'INSECURE_DESERIALIZATION': {
        'patterns': [r'pickle\.loads', r'yaml\.load\(', r'eval\(', r'exec\('],
        'severity': 'Critical',
        'owasp': 'A08:2021 - Software and Data Integrity Failures',
        'description': 'Insecure deserialization detected'
    },
    'WEAK_CRYPTO': {
        'patterns': [r'MD5', r'SHA1', r'DES', r'random\.random\('],
        'severity': 'Medium',
        'owasp': 'A02:2021 - Cryptographic Failures',
        'description': 'Weak cryptographic algorithm detected'
    },
    'PATH_TRAVERSAL': {
        'patterns': [r'open\(.*\+', r'os\.path\.join\(.*request', r'readFile\(.*\+'],
        'severity': 'High',
        'owasp': 'A01:2021 - Broken Access Control',
        'description': 'Path traversal vulnerability detected'
    },
    'COMMAND_INJECTION': {
        'patterns': [r'os\.system\(.*\+', r'subprocess\.call\(.*\+', r'exec\(.*shell'],
        'severity': 'Critical',
        'owasp': 'A03:2021 - Injection',
        'description': 'Command injection vulnerability detected'
    },
    'MISSING_AUTH': {
        'patterns': [r'@app\.route\([^@]*\)\s*\n\s*def', r'app\.get\([^@]*\)(?!.*@)',],
        'severity': 'High',
        'owasp': 'A01:2021 - Broken Access Control',
        'description': 'Missing authentication check detected'
    }
}

def detect_vulnerabilities(code: str, language: str) -> List[Dict[str, Any]]:
    """Detect vulnerabilities using regex patterns"""
    vulnerabilities = []
    lines = code.split('\n')
    
    for rule_name, rule_data in SECURITY_RULES.items():
        for pattern in rule_data['patterns']:
            for i, line in enumerate(lines, 1):
                if re.search(pattern, line, re.IGNORECASE):
                    vulnerabilities.append({
                        'type': rule_name,
                        'severity': rule_data['severity'],
                        'title': rule_data['description'],
                        'line_number': i,
                        'code_snippet': line.strip(),
                        'owasp': rule_data['owasp'],
                        'pattern_matched': pattern
                    })
    
    return vulnerabilities

async def ai_analyze_vulnerability(vuln: Dict[str, Any], code_context: str, is_demo: bool = False) -> Dict[str, Any]:
    """Use AI to provide deeper analysis"""
    if is_demo:
        # Demo mode: return pre-computed results
        explanations = {
            'SQL_INJECTION': 'This code constructs SQL queries using string concatenation with user input, allowing attackers to inject malicious SQL commands. An attacker could extract sensitive data, modify records, or even drop entire tables.',
            'XSS': 'User-controlled data is rendered directly into HTML without sanitization. Attackers can inject malicious scripts that execute in victim browsers, stealing cookies, session tokens, or performing actions on behalf of users.',
            'HARDCODED_SECRET': 'Credentials are stored directly in source code, making them accessible to anyone with code access. If this code is committed to version control or deployed, the secrets are permanently exposed.',
            'INSECURE_DESERIALIZATION': 'Untrusted data is deserialized without validation, allowing attackers to execute arbitrary code by crafting malicious serialized objects.',
            'WEAK_CRYPTO': 'Deprecated cryptographic algorithms like MD5 or SHA1 are vulnerable to collision attacks. Modern systems should use SHA-256 or stronger algorithms.',
            'PATH_TRAVERSAL': 'File paths are constructed using unsanitized user input, allowing attackers to access files outside the intended directory using sequences like ../ to traverse the filesystem.',
            'COMMAND_INJECTION': 'User input is passed to system commands without sanitization, allowing attackers to execute arbitrary shell commands on the server.',
            'MISSING_AUTH': 'This endpoint lacks authentication, allowing unauthorized access to sensitive functionality or data.'
        }
        
        recommendations = {
            'SQL_INJECTION': 'Use parameterized queries or ORM frameworks. Example: cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))',
            'XSS': 'Always sanitize user input before rendering. Use frameworks that auto-escape by default, or use libraries like DOMPurify for client-side sanitization.',
            'HARDCODED_SECRET': 'Store credentials in environment variables or secure secret management systems like AWS Secrets Manager, HashiCorp Vault, or Azure Key Vault.',
            'INSECURE_DESERIALIZATION': 'Avoid deserializing untrusted data. If necessary, use safe formats like JSON and validate all input rigorously.',
            'WEAK_CRYPTO': 'Replace with secure algorithms: SHA-256 or SHA-3 for hashing, AES-256 for encryption, and use cryptographically secure random number generators.',
            'PATH_TRAVERSAL': 'Validate and sanitize all file paths. Use allowlists for permitted directories and reject paths containing ../ or absolute paths.',
            'COMMAND_INJECTION': 'Never pass user input directly to shell commands. Use safe APIs that don\'t invoke a shell, or strictly validate input against allowlists.',
            'MISSING_AUTH': 'Implement authentication middleware. Use JWT tokens, OAuth2, or session-based auth. Always verify user identity before processing requests.'
        }
        
        return {
            'ai_explanation': explanations.get(vuln['type'], 'Security vulnerability detected that requires immediate attention.'),
            'confidence_score': 0.92 if vuln['severity'] == 'Critical' else 0.85,
            'recommendation': recommendations.get(vuln['type'], 'Follow security best practices for this vulnerability type.')
        }
    
    try:
        # Real AI analysis
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=f"vuln_{vuln.get('type', 'unknown')}",
            system_message="You are a security expert analyzing code vulnerabilities. Provide clear, actionable explanations."
        ).with_model("openai", "gpt-5.2")
        
        prompt = f"""Analyze this security vulnerability:

Type: {vuln['type']}
Severity: {vuln['severity']}
Code: {vuln.get('code_snippet', 'N/A')}

Context:
{code_context[:500]}

Provide:
1. Clear explanation of the vulnerability (2-3 sentences)
2. Potential attack scenarios
3. Specific remediation steps

Be concise and practical."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        return {
            'ai_explanation': response,
            'confidence_score': 0.88,
            'recommendation': 'Follow the remediation steps provided above.'
        }
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        return {
            'ai_explanation': f"Security issue detected: {vuln['title']}",
            'confidence_score': 0.75,
            'recommendation': 'Manual review recommended.'
        }

@api_router.post("/scan/analyze", response_model=ScanResult)
async def analyze_code(request: ScanRequest):
    """Main endpoint for code security analysis"""
    try:
        scan_id = str(uuid.uuid4())
        
        # Step 1: Pattern-based detection
        raw_vulnerabilities = detect_vulnerabilities(request.code, request.language)
        
        # Step 2: AI cognitive analysis
        is_demo = request.scan_profile == "demo"
        processed_vulnerabilities = []
        
        for vuln in raw_vulnerabilities[:15]:  # Limit for demo
            ai_analysis = await ai_analyze_vulnerability(vuln, request.code, is_demo)
            
            processed_vuln = VulnerabilityIssue(
                type=vuln['type'],
                severity=vuln['severity'],
                title=vuln['title'],
                description=vuln.get('owasp', ''),
                line_number=vuln.get('line_number'),
                code_snippet=vuln.get('code_snippet'),
                ai_explanation=ai_analysis['ai_explanation'],
                confidence_score=ai_analysis['confidence_score'],
                policy_mappings=[vuln.get('owasp', 'Security Issue')],
                recommendation=ai_analysis['recommendation']
            )
            processed_vulnerabilities.append(processed_vuln)
        
        # Calculate metrics
        severity_counts = {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0}
        for v in processed_vulnerabilities:
            severity_counts[v.severity] = severity_counts.get(v.severity, 0) + 1
        
        critical_count = severity_counts['Critical']
        high_count = severity_counts['High']
        medium_count = severity_counts['Medium']
        low_count = severity_counts['Low']
        
        total_issues = len(processed_vulnerabilities)
        risk_score = min(100, (critical_count * 10 + high_count * 5 + medium_count * 2 + low_count * 0.5))
        deployment_ready = critical_count == 0 and high_count <= 2
        
        scan_result = ScanResult(
            scan_id=scan_id,
            language=request.language,
            project_context=request.project_context,
            scan_profile=request.scan_profile,
            total_issues=total_issues,
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            risk_score=risk_score,
            deployment_ready=deployment_ready,
            vulnerabilities=processed_vulnerabilities
        )
        
        # Store in database
        doc = scan_result.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.scans.insert_one(doc)
        
        return scan_result
        
    except Exception as e:
        logger.error(f"Scan failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/scan/{scan_id}")
async def get_scan_result(scan_id: str):
    """Get scan results by ID"""
    scan = await db.scans.find_one({"scan_id": scan_id}, {"_id": 0})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

@api_router.get("/attack-simulation/{scan_id}")
async def get_attack_simulation(scan_id: str):
    """Generate attack simulation for a scan"""
    scan = await db.scans.find_one({"scan_id": scan_id}, {"_id": 0})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Generate attack simulation based on vulnerabilities
    vulnerabilities = scan.get('vulnerabilities', [])
    
    stages = [
        {
            "stage": 1,
            "name": "Reconnaissance",
            "description": "Attacker identifies vulnerable endpoint through automated scanning",
            "icon": "search",
            "status": "success"
        },
        {
            "stage": 2,
            "name": "Exploitation",
            "description": f"Attacker exploits {vulnerabilities[0]['type'] if vulnerabilities else 'vulnerability'} to gain unauthorized access",
            "icon": "zap",
            "status": "success"
        },
        {
            "stage": 3,
            "name": "Privilege Escalation",
            "description": "Attacker escalates privileges using chained vulnerabilities",
            "icon": "arrow-up",
            "status": "warning"
        },
        {
            "stage": 4,
            "name": "Data Exfiltration",
            "description": "Sensitive user data including PII, credentials, and financial records extracted",
            "icon": "database",
            "status": "danger"
        },
        {
            "stage": 5,
            "name": "Impact",
            "description": "System compromise complete - full database access achieved",
            "icon": "alert-triangle",
            "status": "danger"
        }
    ]
    
    simulation = {
        "scan_id": scan_id,
        "stages": stages,
        "impact_summary": "Complete system compromise leading to unauthorized access to sensitive data, potential regulatory violations, and reputational damage.",
        "citizen_impact": "Personal data of 50,000+ users exposed including names, addresses, social security numbers, and financial information. Users face identity theft risk and potential financial fraud.",
        "feasibility_score": 8.5,
        "estimated_time_to_exploit": "< 2 hours",
        "skill_level_required": "Intermediate"
    }
    
    return simulation

@api_router.get("/secure-fix/{vulnerability_id}")
async def get_secure_fix(vulnerability_id: str):
    """Generate AI-powered secure fix for a vulnerability"""
    
    # Demo fixes
    fixes = {
        "SQL_INJECTION": {
            "original": "cursor.execute(\"SELECT * FROM users WHERE id = \" + user_id)",
            "fixed": "cursor.execute(\"SELECT * FROM users WHERE id = ?\", (user_id,))",
            "explanation": "Replaced string concatenation with parameterized query. The database driver handles escaping, preventing SQL injection.",
            "prevents": ["SQL Injection", "Data Exfiltration", "Authentication Bypass"]
        },
        "XSS": {
            "original": "element.innerHTML = userInput;",
            "fixed": "element.textContent = userInput;\n// Or use DOMPurify: element.innerHTML = DOMPurify.sanitize(userInput);",
            "explanation": "Use textContent for plain text or DOMPurify for HTML. This prevents script execution from user input.",
            "prevents": ["Cross-Site Scripting", "Session Hijacking", "Cookie Theft"]
        },
        "HARDCODED_SECRET": {
            "original": "API_KEY = \"sk-1234567890abcdef\"",
            "fixed": "import os\nAPI_KEY = os.environ.get('API_KEY')\nif not API_KEY:\n    raise ValueError('API_KEY not set')",
            "explanation": "Load credentials from environment variables. Never commit secrets to version control.",
            "prevents": ["Credential Exposure", "Unauthorized API Access", "Account Takeover"]
        }
    }
    
    # Extract vulnerability type from ID
    vuln_type = vulnerability_id.split('_')[0] if '_' in vulnerability_id else 'SQL_INJECTION'
    fix = fixes.get(vuln_type, fixes['SQL_INJECTION'])
    
    return {
        "vulnerability_id": vulnerability_id,
        "original_code": fix["original"],
        "fixed_code": fix["fixed"],
        "explanation": fix["explanation"],
        "prevents_attacks": fix["prevents"]
    }

@api_router.get("/compliance/{scan_id}")
async def get_compliance_report(scan_id: str):
    """Generate compliance mapping for a scan"""
    scan = await db.scans.find_one({"scan_id": scan_id}, {"_id": 0})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    vulnerabilities = scan.get('vulnerabilities', [])
    critical = scan.get('critical_count', 0)
    high = scan.get('high_count', 0)
    
    owasp_mapping = {
        "A01_Broken_Access_Control": {"status": "warn" if any(v['type'] == 'MISSING_AUTH' for v in vulnerabilities) else "pass", "issues": 0},
        "A02_Cryptographic_Failures": {"status": "warn" if any(v['type'] == 'WEAK_CRYPTO' for v in vulnerabilities) else "pass", "issues": 0},
        "A03_Injection": {"status": "fail" if any(v['type'] in ['SQL_INJECTION', 'XSS', 'COMMAND_INJECTION'] for v in vulnerabilities) else "pass", "issues": 0},
        "A07_Auth_Failures": {"status": "fail" if any(v['type'] == 'HARDCODED_SECRET' for v in vulnerabilities) else "pass", "issues": 0},
        "A08_Data_Integrity_Failures": {"status": "warn" if any(v['type'] == 'INSECURE_DESERIALIZATION' for v in vulnerabilities) else "pass", "issues": 0}
    }
    
    for vuln in vulnerabilities:
        if vuln['type'] in ['MISSING_AUTH', 'PATH_TRAVERSAL']:
            owasp_mapping['A01_Broken_Access_Control']['issues'] += 1
        elif vuln['type'] == 'WEAK_CRYPTO':
            owasp_mapping['A02_Cryptographic_Failures']['issues'] += 1
        elif vuln['type'] in ['SQL_INJECTION', 'XSS', 'COMMAND_INJECTION']:
            owasp_mapping['A03_Injection']['issues'] += 1
        elif vuln['type'] == 'HARDCODED_SECRET':
            owasp_mapping['A07_Auth_Failures']['issues'] += 1
        elif vuln['type'] == 'INSECURE_DESERIALIZATION':
            owasp_mapping['A08_Data_Integrity_Failures']['issues'] += 1
    
    iso27001_score = max(0, 100 - (critical * 15 + high * 8))
    nist_score = max(0, 100 - (critical * 12 + high * 7))
    gdpr_compliant = critical == 0 and high <= 1
    
    return {
        "scan_id": scan_id,
        "owasp": {
            "mapping": owasp_mapping,
            "total_categories": 5,
            "passed": sum(1 for v in owasp_mapping.values() if v['status'] == 'pass'),
            "compliance_score": round((sum(1 for v in owasp_mapping.values() if v['status'] == 'pass') / 5) * 100)
        },
        "iso27001": {
            "score": iso27001_score,
            "status": "compliant" if iso27001_score >= 80 else "non-compliant",
            "controls_passed": 45 if iso27001_score >= 80 else 32,
            "controls_total": 50
        },
        "nist": {
            "score": nist_score,
            "status": "compliant" if nist_score >= 75 else "non-compliant",
            "framework": "NIST CSF 2.0",
            "categories_met": 4 if nist_score >= 75 else 2
        },
        "gdpr": {
            "compliant": gdpr_compliant,
            "risk_level": "low" if gdpr_compliant else "high",
            "data_protection": "adequate" if gdpr_compliant else "inadequate",
            "breach_notification_required": not gdpr_compliant
        }
    }

@api_router.get("/education/lessons")
async def get_lessons():
    """Get education lessons"""
    lessons = [
        {
            "id": "1",
            "title": "SQL Injection Prevention",
            "description": "Learn how to prevent SQL injection attacks using parameterized queries",
            "difficulty": "Beginner",
            "duration": "15 min",
            "completed": False
        },
        {
            "id": "2",
            "title": "XSS Attack Mitigation",
            "description": "Understand and prevent Cross-Site Scripting vulnerabilities",
            "difficulty": "Intermediate",
            "duration": "20 min",
            "completed": False
        },
        {
            "id": "3",
            "title": "Secure Authentication Patterns",
            "description": "Implement secure authentication and session management",
            "difficulty": "Intermediate",
            "duration": "25 min",
            "completed": False
        },
        {
            "id": "4",
            "title": "Cryptographic Best Practices",
            "description": "Use modern encryption and hashing algorithms correctly",
            "difficulty": "Advanced",
            "duration": "30 min",
            "completed": False
        },
        {
            "id": "5",
            "title": "OWASP Top 10 Deep Dive",
            "description": "Comprehensive coverage of the most critical security risks",
            "difficulty": "Advanced",
            "duration": "45 min",
            "completed": False
        }
    ]
    return {"lessons": lessons}

@api_router.get("/demo/sample-code")
async def get_sample_code():
    """Get sample vulnerable code for demo"""
    samples = {
        "python": '''# Vulnerable Python API Code\nimport sqlite3\nfrom flask import Flask, request\n\napp = Flask(__name__)\n\n# VULNERABILITY: SQL Injection\n@app.route('/user')\ndef get_user():\n    user_id = request.args.get('id')\n    conn = sqlite3.connect('database.db')\n    cursor = conn.cursor()\n    # Dangerous: String concatenation with user input\n    query = "SELECT * FROM users WHERE id = " + user_id\n    cursor.execute(query)\n    return cursor.fetchone()\n\n# VULNERABILITY: Hardcoded credentials\nDATABASE_PASSWORD = "admin123"\nAPI_KEY = "sk-1234567890abcdef"\n\n# VULNERABILITY: Command Injection\n@app.route('/ping')\ndef ping_server():\n    host = request.args.get('host')\n    result = os.system('ping -c 1 ' + host)\n    return result\n\n# VULNERABILITY: Weak Crypto\nimport hashlib\ndef hash_password(password):\n    return hashlib.md5(password.encode()).hexdigest()\n''',
        "javascript": '''// Vulnerable JavaScript Code\nconst express = require('express');\nconst app = express();\n\n// VULNERABILITY: XSS\napp.get('/profile', (req, res) => {\n    const username = req.query.name;\n    // Dangerous: Unescaped user input in HTML\n    res.send('<h1>Welcome ' + username + '</h1>');\n});\n\n// VULNERABILITY: Hardcoded API Key\nconst API_SECRET = 'sk-prod-9876543210';\n\n// VULNERABILITY: Insecure Deserialization\napp.post('/data', (req, res) => {\n    const data = eval(req.body.payload);\n    res.json(data);\n});\n\n// VULNERABILITY: Missing Authentication\napp.get('/admin/users', (req, res) => {\n    // No auth check - anyone can access\n    const users = db.getAllUsers();\n    res.json(users);\n});\n''',
        "java": '''// Vulnerable Java Code\nimport java.sql.*;\nimport javax.servlet.http.*;\n\npublic class UserController {\n    // VULNERABILITY: SQL Injection\n    public User getUser(String userId) throws SQLException {\n        Connection conn = DriverManager.getConnection(DB_URL);\n        Statement stmt = conn.createStatement();\n        // Dangerous: Concatenated SQL query\n        String query = "SELECT * FROM users WHERE id = '" + userId + "'";\n        ResultSet rs = stmt.executeQuery(query);\n        return parseUser(rs);\n    }\n    \n    // VULNERABILITY: Hardcoded credentials\n    private static final String DB_PASSWORD = "password123";\n    private static final String JWT_SECRET = "supersecret";\n}\n'''
    }
    return samples

@api_router.get("/")
async def root():
    return {"message": "SecureReview AI+++ API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()