import * as puppeteer from 'puppeteer'

const CHROME_EXEC_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PAGE_URL =
    'https://thewest.com.au/news/crime/phillip-zillner-jailed-for-outrageous-hoax-calls-to-women-ng-b88858923z'

main()

async function main() {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: CHROME_EXEC_PATH
    })
    process.on('SIGINT', browser.close)

    try {
        await navigate(browser)
    } catch (err) {
        console.error(err)
    }
}

async function navigate(browser: puppeteer.Browser) {
    const page = await browser.newPage()
    page.on('response', responseHandler)

    await page.setViewport({ width: 1920, height: 2160 })
    await page.goto(PAGE_URL, { timeout: 0 })

    console.log('\x1B[32;1mWaiting for video play button to appear...\x1B[0m')
    await page.waitForSelector('.vjs-big-play-button', { timeout: 5000 })
    console.log('\x1B[32;1mClicking play button!\x1B[0m')
    await page.click('.vjs-big-play-button')

    await browser.close()
}

async function responseHandler(event: puppeteer.Response) {
    const url = event.url()
    const isAdCall = url.startsWith('https://pubads.g.doubleclick.net/gampad/ads?')
    if (!isAdCall) {
        return
    }

    console.log(`Found ad call: ${url.slice(0, 80)}...`)
    const response = await event.text()
    console.log(`Response: ${response.slice(0, 80)}...`)
}
