import { UrlLoaderService, TextAndLinks } from './services/url-loader.service.js';
import { Command } from 'commander';

interface AppParameters {
  url: string;
  word: string;
  depth: number;
}

export const DEFAULT_URL = 'https://www.kayako.com/';

export class App {
  private readonly command: Command;

  constructor(private readonly urlLoader: UrlLoaderService) {
    this.command = new Command();
  }

  async run(): Promise<void> {
    const appParameters = this.parseCli();

    await this.process(appParameters);
  }

  private async process(appParameters: AppParameters): Promise<void> {
    const { url, word, depth } = appParameters;
    const visitedUrls: Set<string> = new Set();
    const queue: { url: string; level: number }[] = [{ url, level: 0 }];
    let count = 0;

    while (queue.length > 0) {
      const { url, level } = queue.shift()!;
      if (visitedUrls.has(url)) continue;
      visitedUrls.add(url);

      const { text, links } = await this.urlLoader.loadUrlTextAndLinks(url, level);
      const wordOccurrences = this.countWordOccurrences(word, text);
      count += wordOccurrences;

      console.log(`Scanned ${url} (Level ${level}), Found ${wordOccurrences} instances of '${word}'`);

      if (level < depth) {
        for (const link of links) {
          queue.push({ url: link, level: level + 1 });
        }
      }
    }

    console.log(`Total instances of '${word}': ${count}`);
  }

  private countWordOccurrences(word: string, text: string): number {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
    return (text.match(wordRegex) || []).length;
  }

  parseCli(): AppParameters {
    this.command
      .requiredOption('-u, --url <url>', 'URL to load', DEFAULT_URL)
      .option('-w, --word <word>', 'Word to search', 'kayako')
      .option('-d, --depth <depth>', 'Scan depth level', parseInt, 2);

    this.command.parse(process.argv);
    const options = this.command.opts();

    return { url: options.url, word: options.word, depth: options.depth };
  }
}
