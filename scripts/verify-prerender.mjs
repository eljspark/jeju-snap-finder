#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const distPath = 'dist'

function verifyPrerender() {
  console.log('🔍 Verifying prerendered HTML files...')

  const testRoutes = [
    { path: 'index.html', name: 'Home' },
    { path: 'jeju/index.html', name: 'Jeju Listing' }
  ]

  let allPassed = true

  testRoutes.forEach(route => {
    const filePath = join(distPath, route.path)
    
    if (!existsSync(filePath)) {
      console.log(`❌ ${route.name}: File ${route.path} not found`)
      allPassed = false
      return
    }

    const content = readFileSync(filePath, 'utf-8')
    const contentLength = content.length

    // Check if content is substantial (> 2k chars)
    if (contentLength < 2000) {
      console.log(`❌ ${route.name}: HTML too short (${contentLength} chars)`)
      allPassed = false
      return
    }

    // Check for real content (not just placeholders)
    const hasRealContent = content.includes('스냅') || 
                          content.includes('제주') || 
                          content.includes('사진') ||
                          content.includes('JejuSnapFinder')

    if (!hasRealContent) {
      console.log(`❌ ${route.name}: No real package content found`)
      allPassed = false
      return
    }

    console.log(`✅ ${route.name}: ${contentLength} chars, contains real content`)
  })

  // Check for at least one package detail page
  const packageDirs = ['packages']
  let foundPackageDetail = false

  packageDirs.forEach(dir => {
    const packagePath = join(distPath, dir)
    if (existsSync(packagePath)) {
      foundPackageDetail = true
      console.log(`✅ Package details: Found prerendered package pages`)
    }
  })

  if (!foundPackageDetail) {
    console.log(`❌ Package details: No prerendered package pages found`)
    allPassed = false
  }

  if (allPassed) {
    console.log('\n🎉 All prerender verification checks passed!')
  } else {
    console.log('\n❌ Some prerender verification checks failed')
    process.exit(1)
  }
}

verifyPrerender()