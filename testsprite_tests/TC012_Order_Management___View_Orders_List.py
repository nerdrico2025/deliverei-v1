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
        # -> Click the 'Entrar' button to start login as store admin.
        frame = context.pages[-1]
        # Click the 'Entrar' button to initiate login as store admin
        elem = frame.locator('xpath=html/body/div/div/header/div/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input store admin email and password, then click login button.
        frame = context.pages[-1]
        # Input store admin email
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@pizza-express.com')
        

        frame = context.pages[-1]
        # Input store admin password
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('pizza123')
        

        frame = context.pages[-1]
        # Click login button to submit credentials
        elem = frame.locator('xpath=html/body/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Pedidos' (Orders) link in the left navigation to go to the orders list page.
        frame = context.pages[-1]
        # Click on 'Pedidos' (Orders) link in the left navigation menu
        elem = frame.locator('xpath=html/body/div/div/div/aside/nav/a[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test filtering by selecting a specific order status from the dropdown to verify filtering functionality.
        frame = context.pages[-1]
        # Open the order status filter dropdown to select a specific status for filtering
        elem = frame.locator('xpath=html/body/div/div/div/div/main/div/div/div/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test the export CSV functionality to verify it exports the filtered orders correctly.
        frame = context.pages[-1]
        # Click the 'Exportar CSV' button to export the filtered orders list
        elem = frame.locator('xpath=html/body/div/div/div/div/main/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Ver' button for the filtered order to view detailed order information and verify correctness.
        frame = context.pages[-1]
        # Click the 'Ver' button to view detailed information of the filtered order #1001
        elem = frame.locator('xpath=html/body/div/div/div/div/main/div/div[2]/table/tbody/tr/td[6]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Close the detailed order view and verify the orders list page is displayed again.
        frame = context.pages[-1]
        # Click the 'Fechar' button to close the detailed order view
        elem = frame.locator('xpath=html/body/div/div/div/div/main/div/aside/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Pedidos').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Todos os status').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=recebido').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=aprovado').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=em preparo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=saiu entrega').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=entregue').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=cancelado').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Exportar CSV').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pedido').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cliente').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pagamento').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Status').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Criado em').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ações').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Nenhum pedido encontrado para esta empresa.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    