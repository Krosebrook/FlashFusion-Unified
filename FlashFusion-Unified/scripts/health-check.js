/**
 * Health Check Script for FlashFusion Unified Platform
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function healthCheck() {
  console.log("🔍 Starting FlashFusion Unified Platform Health Check...\n");

  const checks = {
    environment: false,
    dependencies: false,
    configuration: false,
    database: false,
    aiServices: false,
  };

  try {
    // Check environment variables
    console.log("1. Checking environment variables...");
    const requiredEnvVars = ["NODE_ENV", "PORT"];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );
    if (missingEnvVars.length === 0) {
      console.log("   ✅ Environment variables configured");
      checks.environment = true;
    } else {
      console.log(
        `   ⚠️  Missing environment variables: ${missingEnvVars.join(", ")}`
      );
    }

    // Check dependencies
    console.log("\n2. Checking dependencies...");
    try {
      const express = require("express");
      const cors = require("cors");
      const helmet = require("helmet");
      console.log("   ✅ Core dependencies available");
      checks.dependencies = true;
    } catch (error) {
      console.log(`   ❌ Missing dependencies: ${error.message}`);
    }

    // Check configuration
    console.log("\n3. Checking configuration...");
    try {
      const config = require("../src/config/environment");
      config.validate();
      console.log("   ✅ Configuration validation passed");
      checks.configuration = true;
    } catch (error) {
      console.log(`   ⚠️  Configuration issues: ${error.message}`);
    }

    // Check database configuration
    console.log("\n4. Checking database configuration...");
    const dbConfig = {
      supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      postgresql: !!(process.env.POSTGRES_URL || process.env.DATABASE_URL),
    };

    if (dbConfig.supabase || dbConfig.postgresql) {
      console.log("   ✅ Database configuration found");
      checks.database = true;
    } else {
      console.log("   ⚠️  No database configuration found");
    }

    // Check AI services
    console.log("\n5. Checking AI services...");
    const aiConfig = {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
    };

    if (aiConfig.openai || aiConfig.anthropic || aiConfig.gemini) {
      console.log("   ✅ AI service configuration found");
      checks.aiServices = true;
    } else {
      console.log("   ⚠️  No AI service configuration found");
    }

    // Summary
    console.log("\n📊 Health Check Summary:");
    console.log("========================");

    const totalChecks = Object.keys(checks).length;
    const passedChecks = Object.values(checks).filter(Boolean).length;

    Object.entries(checks).forEach(([check, passed]) => {
      const status = passed ? "✅" : "❌";
      console.log(`${status} ${check}: ${passed ? "PASSED" : "FAILED"}`);
    });

    console.log(
      `\nOverall Status: ${passedChecks}/${totalChecks} checks passed`
    );

    if (passedChecks === totalChecks) {
      console.log("🎉 All health checks passed! FlashFusion is ready to run.");
      process.exit(0);
    } else {
      console.log(
        "⚠️  Some health checks failed. Please review the issues above."
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Health check failed with error:", error.message);
    process.exit(1);
  }
}

// Run health check
if (require.main === module) {
  healthCheck();
}

module.exports = { healthCheck };
