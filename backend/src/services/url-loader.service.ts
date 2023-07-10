import puppeteer, { Browser } from 'puppeteer';

export interface TextAndLinks {
  text: string;
  links: string[];
}

export class UrlLoaderService {
  private static instance: UrlLoaderService;

  static async getInstance(): Promise<UrlLoaderService> {
    if (UrlLoaderService.instance === undefined) {
      const browser = await puppeteer.launch();
      UrlLoaderService.instance = new UrlLoaderService(browser);
    }
    return UrlLoaderService.instance;
  }

  private constructor(private readonly browser: Browser) {}

  async loadUrlTextAndLinks(url: string, level: number): Promise<TextAndLinks> {
    const page = await this.browser.newPage();
  
    try {
      if (!url.endsWith('.pdf')) {
        await page.goto(url);
        await page.waitForSelector('body');
  
        const [text, links] = await Promise.all([
          page.evaluate(() => document.body.innerText),
          page.evaluate(() => Array.from(document.getElementsByTagName('a'), (a) => a.href)),
        ]);
  
        return { text, links };
      } else {
        return { text: '', links: [] };
      }
    } catch (error) {
      console.error(`Error loading URL: ${url}`, error);
      return { text: '', links: [] };
    } finally {
      await page.close();
    }
  }
  
  
}

export default UrlLoaderService;
