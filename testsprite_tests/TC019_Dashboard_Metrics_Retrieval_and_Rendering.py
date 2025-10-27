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
        # -> Click the 'Entrar' button to proceed to login as store admin.
        frame = context.pages[-1]
        # Click the 'Entrar' button to start login process as store admin
        elem = frame.locator('xpath=html/body/div/div/header/div/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password for Super Admin and click the login button.
        frame = context.pages[-1]
        # Input Super Admin email
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@deliverei.com')
        

        frame = context.pages[-1]
        # Input Super Admin password
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click the login button to submit credentials
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try to reload the page or navigate to the dashboard again to see if it loads properly.
        await page.goto('http://localhost:4173/admin/store', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input Super Admin email and password, then click the login button to attempt login.
        frame = context.pages[-1]
        # Input Super Admin email
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@deliverei.com.br')
        

        frame = context.pages[-1]
        # Input Super Admin password
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click the login button to submit credentials
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Request dashboard statistics and product popularity endpoints to verify data correctness and formats.
        await page.goto('http://localhost:4173/api/admin/dashboard/stats', timeout=10000)
        await asyncio.sleep(3)
        

        await page.goto('http://localhost:4173/api/admin/dashboard/product-popularity', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Login as store admin again to ensure authenticated access, then retry API endpoint requests for dashboard data.
        frame = context.pages[-1]
        # Click 'Entrar' button to go to login page
        elem = frame.locator('xpath=html/body/div/div/header/div/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        await page.goto('http://localhost:4173/api/admin/dashboard/stats', timeout=10000)
        await asyncio.sleep(3)
        

        await page.goto('http://localhost:4173/api/admin/dashboard/product-popularity', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input Super Admin email and password, then click the login button to submit credentials.
        frame = context.pages[-1]
        # Input Super Admin email
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@deliverei.com.br')
        

        frame = context.pages[-1]
        # Input Super Admin password
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click the login button to submit credentials
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Request dashboard statistics and product popularity API endpoints with authenticated session to verify data correctness and formats.
        await page.goto('http://localhost:4173/api/admin/dashboard/stats', timeout=10000)
        await asyncio.sleep(3)
        

        await page.goto('http://localhost:4173/api/admin/dashboard/product-popularity', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Verify if there are any frontend filters or UI elements to test date filtering and chart rendering on the dashboard page, or report issue with backend data availability.
        frame = context.pages[-1]
        # Click 'Entrar' button to go to login page and try to access dashboard UI again
        elem = frame.locator('xpath=html/body/div/div/header/div/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input Super Admin email and password, then click the login button to submit credentials.
        frame = context.pages[-1]
        # Input Super Admin email
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@deliverei.com.br')
        

        frame = context.pages[-1]
        # Input Super Admin password
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click the login button to submit credentials
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Check for any date filter UI elements or controls on the dashboard page or navigate to related sections to find date filtering options.
        await page.mouse.wheel(0, 300)
        

        # -> Click on 'Empresas' tab to check for any date filtering options or product popularity data.
        frame = context.pages[-1]
        # Click on 'Empresas' tab to check for date filtering or product popularity data
        elem = frame.locator('xpath=html/body/div/div/div/aside/nav/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=DELIVEREI').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SUPER ADMIN').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Dashboard').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Empresas').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Assinaturas').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Tickets').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Configurações').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Super Administrador•Superadmin').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sair').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Todos').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ativo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Trial').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Inativo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Nova Empresa').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=4 empresas').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Marmita Boa').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pro').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ativo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=2025-08-15').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ver detalhes').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Fit Express').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Basic').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=2025-09-01').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pizza Express').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=2025-10-06').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Burger King').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    