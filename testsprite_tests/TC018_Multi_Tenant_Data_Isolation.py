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
        # -> Click the 'Entrar' button to proceed to login.
        frame = context.pages[-1]
        # Click the 'Entrar' button to go to login page
        elem = frame.locator('xpath=html/body/div/div/header/div/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password for user from Tenant A and submit login form.
        frame = context.pages[-1]
        # Input email for user from Tenant A (Pizza Express)
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@pizza-express.com')
        

        frame = context.pages[-1]
        # Input password for user from Tenant A (Pizza Express)
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('pizza123')
        

        frame = context.pages[-1]
        # Click the 'Entrar' button to submit login form
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Produtos' to check products data isolation for Tenant B.
        frame = context.pages[-1]
        # Click on 'Produtos' to view products for Tenant A and attempt to access Tenant B's products
        elem = frame.locator('xpath=html/body/div/div/div/aside/nav/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password for user from Tenant A and submit login form to restore session.
        frame = context.pages[-1]
        # Input email for user from Tenant A (Pizza Express)
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@pizza-express.com')
        

        frame = context.pages[-1]
        # Input password for user from Tenant A (Pizza Express)
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('pizza123')
        

        frame = context.pages[-1]
        # Click the 'Entrar' button to submit login form
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try logging in as Super Admin to verify if login system works and then retry Tenant A login.
        frame = context.pages[-1]
        # Input email for Super Admin
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@deliverei.com.br')
        

        frame = context.pages[-1]
        # Input password for Super Admin
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click the 'Entrar' button to submit login form for Super Admin
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Empresas' to check tenant data isolation in companies module.
        frame = context.pages[-1]
        # Click on 'Empresas' to view companies and verify tenant data isolation
        elem = frame.locator('xpath=html/body/div/div/div/aside/nav/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Ver detalhes' for Pizza Express to verify data isolation for Tenant A.
        frame = context.pages[-1]
        # Click 'Ver detalhes' for Pizza Express company to verify tenant data isolation for Tenant A
        elem = frame.locator('xpath=html/body/div/div/div/div/main/div/div[3]/table/tbody/tr[5]/td[5]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password for Super Admin and submit login form to restore session.
        frame = context.pages[-1]
        # Input email for Super Admin
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@deliverei.com.br')
        

        frame = context.pages[-1]
        # Input password for Super Admin
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click the 'Entrar' button to submit login form for Super Admin
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Empresas' to verify tenant data isolation in the companies module.
        frame = context.pages[-1]
        # Click on 'Empresas' to view companies and verify tenant data isolation
        elem = frame.locator('xpath=html/body/div/div/div/aside/nav/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Ver detalhes' button for Pizza Express to verify tenant data isolation for Tenant A.
        frame = context.pages[-1]
        # Click 'Ver detalhes' for Pizza Express company to verify tenant data isolation for Tenant A
        elem = frame.locator('xpath=html/body/div/div/div/div/main/div/div[3]/table/tbody/tr[5]/td[5]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password for user from Tenant A and submit login form.
        frame = context.pages[-1]
        # Input email for user from Tenant A (Pizza Express)
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@pizza-express.com')
        

        frame = context.pages[-1]
        # Input password for user from Tenant A (Pizza Express)
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('pizza123')
        

        frame = context.pages[-1]
        # Click the 'Entrar' button to submit login form for user from Tenant A
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password for Burger King user and submit login form.
        frame = context.pages[-1]
        # Input email for Burger King user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@burger-king.com')
        

        frame = context.pages[-1]
        # Input password for Burger King user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('burger123')
        

        frame = context.pages[-1]
        # Click the 'Entrar' button to submit login form for Burger King user
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Entrar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=E-mail').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Senha').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Credenciais de teste:').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Super Admin: admin@deliverei.com.br / admin123').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pizza Express: admin@pizza-express.com / pizza123').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Burger King: admin@burger-king.com / burger123').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cliente: cliente@exemplo.com / cliente123').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    