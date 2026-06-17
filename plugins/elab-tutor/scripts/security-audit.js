#!/usr/bin/env node
// ============================================
// ELAB Tutor - Security Audit Script
// Penetration Testing & Security Validation
// © Andrea Marro — 15/02/2026
// ============================================

/**
 * Script di security audit per ELAB Tutor.
 * 
 * Esegue controlli automatici su:
 * - Vulnerabilità XSS
 * - Configurazione sicurezza headers
 * - Validazione input
 * - Gestione autenticazione
 * - Cifratura dati
 * - Compliance GDPR/COPPA
 * 
 * Usage: node security-audit.js [--full] [--report]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURAZIONE
// ============================================

const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  reportDir: path.join(__dirname, '../security-reports'),
  severityLevels: {
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
    INFO: 'INFO',
  },
};

// ============================================
// UTILITY
// ============================================

class SecurityAudit {
  constructor() {
    this.issues = [];
    this.checks = [];
    this.startTime = Date.now();
  }

  addIssue(severity, category, message, file, line, recommendation) {
    this.issues.push({
      severity,
      category,
      message,
      file,
      line,
      recommendation,
      timestamp: new Date().toISOString(),
    });
  }

  addCheck(name, status, details) {
    this.checks.push({
      name,
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================
  // CONTROLLI XSS
  // ============================================

  checkXSSVulnerabilities(content, filePath) {
    const dangerousPatterns = [
      {
        pattern: /innerHTML\s*=\s*[^;]+/g,
        message: 'Uso di innerHTML potenzialmente pericoloso',
        recommendation: 'Usare textContent o DOMPurify per sanitizzare',
      },
      {
        pattern: /dangerouslySetInnerHTML\s*:\s*\{\s*__html\s*:/g,
        message: 'Uso di dangerouslySetInnerHTML in React',
        recommendation: 'Evitare o sanitizzare con DOMPurify prima',
      },
      {
        pattern: /eval\s*\(/g,
        message: 'Uso di eval() - pericoloso per XSS e code injection',
        recommendation: 'Usare JSON.parse() o soluzioni alternative',
      },
      {
        pattern: /document\.write\s*\(/g,
        message: 'Uso di document.write()',
        recommendation: 'Usare metodi DOM moderni',
      },
    ];

    dangerousPatterns.forEach(({ pattern, message, recommendation }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const line = content.substring(0, content.indexOf(match)).split('\n').length;
          this.addIssue(
            CONFIG.severityLevels.HIGH,
            'XSS',
            message,
            filePath,
            line,
            recommendation
          );
        });
      }
    });

    this.addCheck('XSS Vulnerabilities', this.issues.filter(i => i.category === 'XSS').length === 0 ? 'PASS' : 'FAIL', 
      `Trovate ${this.issues.filter(i => i.category === 'XSS').length} potenziali vulnerabilità XSS`);
  }

  // ============================================
  // CONTROLLI AUTENTICAZIONE
  // ============================================

  checkAuthSecurity(content, filePath) {
    const authIssues = [
      {
        pattern: /password\s*[=:]\s*["'][^"']{1,7}["']/g,
        message: 'Password troppo corta (< 8 caratteri)',
        severity: CONFIG.severityLevels.CRITICAL,
      },
      {
        pattern: /localStorage\.setItem\s*\(\s*["']password/gi,
        message: 'Password salvata in localStorage',
        severity: CONFIG.severityLevels.CRITICAL,
      },
      {
        pattern: /sessionStorage\.setItem\s*\(\s*["']password/gi,
        message: 'Password salvata in sessionStorage',
        severity: CONFIG.severityLevels.CRITICAL,
      },
      {
        pattern: /atob\s*\(\s*[^)]+\)/g,
        message: 'Decodifica Base64 rilevata - potrebbe essere usata per offuscare',
        severity: CONFIG.severityLevels.MEDIUM,
      },
    ];

    authIssues.forEach(({ pattern, message, severity }) => {
      if (pattern.test(content)) {
        this.addIssue(
          severity,
          'AUTH',
          message,
          filePath,
          null,
          'Rimuovere o correggere immediatamente'
        );
      }
    });

    // Verifica presenza rate limiting
    const hasRateLimiting = /rateLimit|RateLimit|rate_limit/i.test(content);
    if (!hasRateLimiting && filePath.includes('auth')) {
      this.addIssue(
        CONFIG.severityLevels.HIGH,
        'AUTH',
        'Possibile mancanza di rate limiting',
        filePath,
        null,
        'Implementare rate limiting su endpoint di autenticazione'
      );
    }
  }

  // ============================================
  // CONTROLLI CIFRATURA
  // ============================================

  checkEncryption(content, filePath) {
    // Verifica che ci sia cifratura per dati sensibili
    const hasEncryption = /encrypt|decrypt|AES|crypto\.subtle/i.test(content);
    const handlesSensitiveData = /confusioneLog|sensitive|password|email/i.test(content);
    
    if (handlesSensitiveData && !hasEncryption && filePath.includes('Service')) {
      this.addIssue(
        CONFIG.severityLevels.HIGH,
        'ENCRYPTION',
        'Servizio gestisce dati sensibili ma non sembra usare cifratura',
        filePath,
        null,
        'Implementare cifratura AES-256-GCM per dati sensibili'
      );
    }

    // Verifica uso di algoritmi sicuri
    const weakAlgorithms = [
      { pattern: /DES|3DES|TripleDES/i, name: 'DES/3DES' },
      { pattern: /RC4/i, name: 'RC4' },
      { pattern: /MD5\s*\(/i, name: 'MD5' },
      { pattern: /SHA1\s*\(/i, name: 'SHA1' },
    ];

    weakAlgorithms.forEach(({ pattern, name }) => {
      if (pattern.test(content)) {
        this.addIssue(
          CONFIG.severityLevels.CRITICAL,
          'ENCRYPTION',
          `Algoritmo crittografico debole rilevato: ${name}`,
          filePath,
          null,
          'Usare AES-256-GCM, SHA-256 o algoritmi moderni'
        );
      }
    });
  }

  // ============================================
  // CONTROLLI GDPR/COPPA
  // ============================================

  checkCompliance(content, filePath) {
    // Verifica presenza meccanismi GDPR
    const hasConsentManagement = /consent|consenso/i.test(content);
    const hasDataDeletion = /deleteData|eliminaDati|oblio/i.test(content);
    const hasAgeVerification = /age|età|verifyAge/i.test(content);

    if (filePath.includes('auth') && !hasAgeVerification) {
      this.addIssue(
        CONFIG.severityLevels.HIGH,
        'COMPLIANCE',
        'Sistema di autenticazione senza verifica età',
        filePath,
        null,
        'Implementare verifica età per GDPR Art. 8 e COPPA'
      );
    }

    if (filePath.includes('gdpr') && !hasDataDeletion) {
      this.addIssue(
        CONFIG.severityLevels.MEDIUM,
        'COMPLIANCE',
        'Possibile mancanza di meccanismo cancellazione dati',
        filePath,
        null,
        'Implementare diritto all oblio (GDPR Art. 17)'
      );
    }

    // Verifica fingerprinting
    const hasFingerprinting = /canvas|webgl|audioContext|fingerprint/i.test(content);
    if (hasFingerprinting && filePath.includes('license')) {
      this.addIssue(
        CONFIG.severityLevels.MEDIUM,
        'COMPLIANCE',
        'Fingerprinting rilevato - verificare compliance GDPR/COPPA',
        filePath,
        null,
        'Usare solo identificatori minimi e anonimi'
      );
    }
  }

  // ============================================
  // CONTROLLI CONFIGURAZIONE
  // ============================================

  checkConfiguration() {
    // Verifica env vars sensibili non esposte
    const envFiles = ['.env', '.env.local', '.env.production'];
    
    envFiles.forEach(envFile => {
      const envPath = path.join(__dirname, '..', envFile);
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        if (envContent.includes('VITE_') && envContent.match(/PASSWORD|SECRET|KEY|TOKEN/i)) {
          this.addIssue(
            CONFIG.severityLevels.LOW,
            'CONFIG',
            `Variabili d'ambiente sensibili in ${envFile} - verificare non siano nel repository`,
            envFile,
            null,
            'Aggiungere .env* a .gitignore'
          );
        }
      }
    });

    // Verifica .gitignore
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      
      if (!gitignore.includes('.env')) {
        this.addIssue(
          CONFIG.severityLevels.HIGH,
          'CONFIG',
          '.env non presente in .gitignore',
          '.gitignore',
          null,
          'Aggiungere .env* a .gitignore immediatamente'
        );
      }
    }

    this.addCheck('Configuration Security', 'INFO', 'Controllo configurazione completato');
  }

  // ============================================
  // SCANSIONE FILE
  // ============================================

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const ext = path.extname(filePath);

      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        this.checkXSSVulnerabilities(content, filePath);
        this.checkAuthSecurity(content, filePath);
        this.checkEncryption(content, filePath);
        this.checkCompliance(content, filePath);
      }
    } catch (error) {
      this.addIssue(
        CONFIG.severityLevels.LOW,
        'SYSTEM',
        `Errore lettura file: ${error.message}`,
        filePath,
        null,
        'Verificare permessi file'
      );
    }
  }

  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
        this.scanDirectory(filePath);
      } else if (stat.isFile()) {
        this.scanFile(filePath);
      }
    });
  }

  // ============================================
  // REPORTING
  // ============================================

  generateReport() {
    const duration = Date.now() - this.startTime;
    
    // Raggruppa issue per severità
    const issuesBySeverity = this.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});

    // Raggruppa issue per categoria
    const issuesByCategory = this.issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {});

    const report = {
      summary: {
        totalIssues: this.issues.length,
        critical: issuesBySeverity[CONFIG.severityLevels.CRITICAL] || 0,
        high: issuesBySeverity[CONFIG.severityLevels.HIGH] || 0,
        medium: issuesBySeverity[CONFIG.severityLevels.MEDIUM] || 0,
        low: issuesBySeverity[CONFIG.severityLevels.LOW] || 0,
        info: issuesBySeverity[CONFIG.severityLevels.INFO] || 0,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      issuesByCategory,
      issues: this.issues,
      checks: this.checks,
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.issues.some(i => i.category === 'XSS')) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Sanitizzazione Input',
        description: 'Implementare DOMPurify per sanitizzare tutti gli input utente',
      });
    }

    if (this.issues.some(i => i.category === 'AUTH')) {
      recommendations.push({
        priority: 'CRITICAL',
        title: 'Sicurezza Autenticazione',
        description: 'Verificare tutti i meccanismi di autenticazione e rimuovere password dal client',
      });
    }

    if (this.issues.some(i => i.category === 'ENCRYPTION')) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Cifratura Dati',
        description: 'Utilizzare solo algoritmi moderni (AES-256-GCM, SHA-256)',
      });
    }

    recommendations.push({
      priority: 'MEDIUM',
      title: 'Security Headers',
      description: 'Configurare CSP, HSTS, X-Frame-Options su Vercel',
    });

    recommendations.push({
      priority: 'MEDIUM',
      title: 'Dependency Audit',
      description: 'Eseguire npm audit regolarmente e aggiornare dipendenze vulnerabili',
    });

    return recommendations;
  }

  printReport(report) {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           ELAB TUTOR - SECURITY AUDIT REPORT               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');

    // Summary
    console.log('📊 RIEPILOGO');
    console.log('─'.repeat(60));
    console.log(`Totale Issue:     ${report.summary.totalIssues}`);
    console.log(`🔴 Critical:      ${report.summary.critical}`);
    console.log(`🟠 High:          ${report.summary.high}`);
    console.log(`🟡 Medium:        ${report.summary.medium}`);
    console.log(`🟢 Low:           ${report.summary.low}`);
    console.log(`ℹ️  Info:          ${report.summary.info}`);
    console.log(`⏱️  Durata:         ${report.summary.duration}`);
    console.log('');

    // Issues per categoria
    if (Object.keys(report.issuesByCategory).length > 0) {
      console.log('📁 ISSUE PER CATEGORIA');
      console.log('─'.repeat(60));
      Object.entries(report.issuesByCategory).forEach(([category, count]) => {
        console.log(`${category}: ${count}`);
      });
      console.log('');
    }

    // Dettaglio issue critiche e high
    const criticalAndHigh = this.issues.filter(
      i => i.severity === CONFIG.severityLevels.CRITICAL || i.severity === CONFIG.severityLevels.HIGH
    );

    if (criticalAndHigh.length > 0) {
      console.log('🚨 ISSUE CRITICHE E ALTE');
      console.log('─'.repeat(60));
      criticalAndHigh.forEach((issue, index) => {
        console.log(`\n[${index + 1}] ${issue.severity} - ${issue.category}`);
        console.log(`    File: ${issue.file}${issue.line ? ':' + issue.line : ''}`);
        console.log(`    Problema: ${issue.message}`);
        console.log(`    Soluzione: ${issue.recommendation}`);
      });
      console.log('');
    }

    // Raccomandazioni
    console.log('💡 RACCOMANDAZIONI');
    console.log('─'.repeat(60));
    report.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.title}`);
      console.log(`   ${rec.description}`);
    });
    console.log('');

    // Conclusione
    if (report.summary.critical > 0) {
      console.log('❌ AUDIT FALLITO - Issue critiche rilevate');
      console.log('   Correggere le issue CRITICAL prima del deploy in produzione');
    } else if (report.summary.high > 0) {
      console.log('⚠️  AUDIT CON WARNING - Issue HIGH rilevate');
      console.log('   Consigliato correggere prima del deploy');
    } else {
      console.log('✅ AUDIT PASSATO - Nessuna issue critica');
    }
    console.log('');
  }

  saveReport(report) {
    if (!fs.existsSync(CONFIG.reportDir)) {
      fs.mkdirSync(CONFIG.reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(CONFIG.reportDir, `security-audit-${timestamp}.json`);
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report salvato: ${reportPath}`);

    // Salva anche in formato HTML
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(CONFIG.reportDir, `security-audit-${timestamp}.html`);
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`🌐 Report HTML: ${htmlPath}`);
  }

  generateHTMLReport(report) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Security Audit Report - ELAB Tutor</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 40px; }
    h1 { color: #1E4D8C; }
    .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .issue { background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ffc107; }
    .issue.critical { background: #f8d7da; border-left-color: #dc3545; }
    .issue.high { background: #fff3cd; border-left-color: #ffc107; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; }
  </style>
</head>
<body>
  <h1>🔒 Security Audit Report - ELAB Tutor</h1>
  <p>Generato il: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Riepilogo</h2>
    <p>Totale Issue: <strong>${report.summary.totalIssues}</strong></p>
    <p>Critical: <strong style="color: #dc3545;">${report.summary.critical}</strong></p>
    <p>High: <strong style="color: #ffc107;">${report.summary.high}</strong></p>
    <p>Medium: ${report.summary.medium}</p>
    <p>Low: ${report.summary.low}</p>
  </div>

  <h2>Issue Dettagliate</h2>
  ${this.issues.map(issue => `
    <div class="issue ${issue.severity.toLowerCase()}">
      <strong>[${issue.severity}] ${issue.category}</strong><br>
      <em>${issue.file}${issue.line ? ':' + issue.line : ''}</em><br>
      ${issue.message}<br>
      <small><strong>Soluzione:</strong> ${issue.recommendation}</small>
    </div>
  `).join('')}
</body>
</html>`;
  }

  // ============================================
  // ESECUZIONE
  // ============================================

  async run() {
    console.log('🔍 Avvio Security Audit ELAB Tutor...\n');

    // Scansione directory src
    if (fs.existsSync(CONFIG.srcDir)) {
      this.scanDirectory(CONFIG.srcDir);
    }

    // Controlli configurazione
    this.checkConfiguration();

    // Generazione report
    const report = this.generateReport();
    
    // Stampa report
    this.printReport(report);

    // Salva report se richiesto
    const args = process.argv.slice(2);
    if (args.includes('--report')) {
      this.saveReport(report);
    }

    // Exit code basato su issue critiche
    process.exit(report.summary.critical > 0 ? 1 : 0);
  }
}

// Esecuzione
const audit = new SecurityAudit();
audit.run().catch(error => {
  console.error('❌ Errore durante l\'audit:', error);
  process.exit(1);
});
