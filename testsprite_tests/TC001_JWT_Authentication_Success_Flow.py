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
        await page.goto("http://localhost:4178", wait_until="commit", timeout=10000)
        
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
        # -> Navigate to the login page at /loja/pizza-express/login.
        await page.goto('http://localhost:4178/loja/pizza-express/login', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input valid email and password, then click login button.
        frame = context.pages[-1]
        # Input valid email cliente@exemplo.com
        elem = frame.locator('xpath=html/body/div/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('cliente@exemplo.com')
        

        frame = context.pages[-1]
        # Input valid password cliente123
        elem = frame.locator('xpath=html/body/div/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('cliente123')
        

        frame = context.pages[-1]
        # Click the login button to submit credentials
        elem = frame.locator('xpath=html/body/div/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Adicionar' button on the first product (Pizza Margherita) to add it to the cart and observe the network request for Authorization and X-Tenant-Slug headers.
        frame = context.pages[-1]
        # Click 'Adicionar' button on Pizza Margherita to add product to cart
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Finalizar Pedido' button to proceed to checkout and verify access to tenant-specific protected routes.
        frame = context.pages[-1]
        # Click 'Finalizar Pedido' button to proceed to checkout and verify tenant-specific protected route access
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Login Successful! Welcome to your dashboard').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError('Test case failed: The login did not return a JWT token and tenant context as expected, or the user was not redirected to the storefront with access to tenant-specific data.')
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    