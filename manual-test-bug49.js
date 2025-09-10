const { chromium } = require('playwright');

async function testBug49Fix() {
  console.log('🚀 Starting manual test for Bug #49 fix...');
  
  // Launch browser in headed mode so we can see what's happening
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down actions for visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    
    // Wait for the page to load
    await page.waitForSelector('button:has-text("Start Playing")', { timeout: 10000 });
    console.log('✅ Application loaded successfully');
    
    // Click Start Playing to go to login
    console.log('🔑 Navigating to login...');
    await page.click('button:has-text("Start Playing")');
    
    // Wait for login form
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log('✅ Login form loaded');
    
    // Login as testuser1
    console.log('👤 Logging in as testuser1...');
    await page.fill('input[type="email"]', 'testuser1@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for successful login and navigation to game
    await page.waitForSelector('text=Welcome', { timeout: 15000 });
    console.log('✅ Successfully logged in as testuser1');
    
    // Navigate to Friends section
    console.log('👥 Navigating to Friends section...');
    
    // Look for Friends tab or button
    const friendsSelector = [
      'text=Friends',
      '[data-testid="friends-tab"]',
      'button:has-text("Friends")',
      'a:has-text("Friends")'
    ];
    
    let friendsFound = false;
    for (const selector of friendsSelector) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.click(selector);
        friendsFound = true;
        console.log(`✅ Found and clicked Friends using selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`❌ Selector ${selector} not found, trying next...`);
      }
    }
    
    if (!friendsFound) {
      console.log('❌ Could not find Friends section. Taking screenshot...');
      await page.screenshot({ path: 'debug-no-friends-section.png' });
      
      // Let's see what's on the page
      const pageContent = await page.textContent('body');
      console.log('Page content preview:', pageContent.substring(0, 500));
      return;
    }
    
    // Wait for friends list to load
    console.log('⏳ Waiting for friends list to load...');
    await page.waitForTimeout(3000);
    
    // Check if Stav Lobel appears in the friends list
    console.log('🔍 Looking for Stav Lobel in friends list...');
    
    const stavFound = await page.isVisible('text=Stav Lobel');
    const noFriendsVisible = await page.isVisible('text=No friends yet');
    
    console.log('📊 Test Results:');
    console.log(`   - Stav Lobel visible: ${stavFound}`);
    console.log(`   - "No friends yet" visible: ${noFriendsVisible}`);
    
    if (stavFound) {
      console.log('✅ BUG #49 FIXED! Stav Lobel is visible in friends list');
    } else if (noFriendsVisible) {
      console.log('❌ BUG #49 STILL EXISTS: Shows "No friends yet" but should show Stav Lobel');
    } else {
      console.log('❓ UNCLEAR: Neither "Stav Lobel" nor "No friends yet" found');
    }
    
    // Take screenshot for evidence
    await page.screenshot({ path: 'bug49-test-result.png' });
    console.log('📸 Screenshot saved as bug49-test-result.png');
    
    // Keep browser open for 10 seconds for manual inspection
    console.log('🔍 Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    await page.screenshot({ path: 'bug49-test-error.png' });
    console.log('📸 Error screenshot saved as bug49-test-error.png');
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

testBug49Fix().catch(console.error);
