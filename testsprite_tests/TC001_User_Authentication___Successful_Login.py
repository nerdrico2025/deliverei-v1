import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:4173", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on the 'Entrar' button to navigate to the login page.
        frame = context.pages[-1]
        # Click on the 'Entrar' button to navigate to the login page.
        elem = frame.locator('xpath=html/body/div/div/header/div/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input valid email and password for Super Admin and click login.
        frame = context.pages[-1]
        # Input valid email for Super Admin user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@deliverei.com.br')
        

        frame = context.pages[-1]
        # Input valid password for Super Admin user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click on the 'Entrar' button to submit login form
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Log out from Super Admin account and navigate back to login page to test Store Admin login.
        await page.goto('http://localhost:4173/logout', timeout=10000)
        await asyncio.sleep(3)
        

        await page.goto('http://localhost:4173/login', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input valid email and password for Store Admin and click login.
        frame = context.pages[-1]
        # Input valid email for Store Admin user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@pizza-express.com')
        

        frame = context.pages[-1]
        # Input valid password for Store Admin user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('pizza123')
        

        frame = context.pages[-1]
        # Click on the 'Entrar' button to submit login form for Store Admin
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input valid email and password for Burger King and click login.
        frame = context.pages[-1]
        # Input valid email for Burger King user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@burger-king.com')
        

        frame = context.pages[-1]
        # Input valid password for Burger King user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('burger123')
        

        frame = context.pages[-1]
        # Click on the 'Entrar' button to submit login form for Burger King
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input valid email and password for Client user and click login.
        frame = context.pages[-1]
        # Input valid email for Client user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('cliente@exemplo.com')
        

        frame = context.pages[-1]
        # Input valid password for Client user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('cliente123')
        

        frame = context.pages[-1]
        # Click on the 'Entrar' button to submit login form for Client user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Loja Exemplo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Seu carrinho está vazio.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Subtotal').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=R$ 0.00').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ir para checkout').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    