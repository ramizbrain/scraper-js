import * as cheerio from "cheerio";

/**
 * HTML Cleaner untuk Scraper Extension
 *
 * File ini berisi fungsi-fungsi untuk membersihkan dan memfilter HTML
 * sebelum dikonversi ke markdown, untuk mengurangi ukuran output
 * dan menghindari rate limit dari OpenAI API.
 */

class HTMLCleaner {
  static clean(html: string): string {
    const $ = cheerio.load(html);
    this.removeUnwantedElements($);
    this.removeUnwantedAttributes($);
    this.limitElements($);
    return $.root().html() || "";
  }

  static removeUnwantedElements($: cheerio.CheerioAPI): void {
    const unwantedSelectors: string[] = [
      "script",
      "style",
      "noscript",
      "iframe",
      "svg",
      "canvas",
      "video",
      "audio",
      "source",
      "track",
      "map",
      "area",
      "footer",
      "nav:not(main nav)",
      "aside",
      "ads",
      ".ads",
      ".advertisement",
      '[role="banner"]',
      '[role="complementary"]',
      '[role="contentinfo"]',
      ".cookie-banner",
      ".cookie-notice",
      ".popup",
      ".modal",
      ".newsletter",
      ".subscription",
      ".social-media",
      ".share-buttons",
      'link[rel="stylesheet"]',
      "meta",
      "head > link",
      "head > style",
      "form:not(main form)",
      'button:not([type="submit"])',
      'input[type="hidden"]',
    ];
    unwantedSelectors.forEach((selector) => {
      $(selector).remove();
    });
    this.removeComments($);
  }

  static removeComments($: cheerio.CheerioAPI): void {
    $("*")
      .contents()
      .each(function () {
        if (this.type === "comment") {
          $(this).remove();
        }
      });
  }

  static removeUnwantedAttributes($: cheerio.CheerioAPI): void {
    const keepAttributes: string[] = [
      "href",
      "src",
      "alt",
      "title",
      "id",
      "class",
      "name",
      "content",
      "type",
      "value",
    ];
    $("*").each(function () {
      if (this.type === "tag" && this.attribs) {
        const attribs = this.attribs;
        Object.keys(attribs).forEach((attr) => {
          if (!keepAttributes.includes(attr)) {
            $(this).removeAttr(attr);
          }
        });
      }
    });
  }

  static limitElements($: cheerio.CheerioAPI): void {
    // Batasi jumlah elemen dalam daftar (ul/ol)
    $("ul, ol").each(function () {
      const items = $(this).find("li");
      if (items.length > 20) {
        items.slice(20).remove();
        $(this).append(
          "<li>... (item lainnya dihapus untuk menghemat ukuran)</li>"
        );
      }
    });
    // Batasi jumlah paragraf jika terlalu banyak
    const paragraphs = $("p");
    if (paragraphs.length > 100) {
      paragraphs.slice(100).remove();
      if (paragraphs.length > 0) {
        paragraphs
          .first()
          .parent()
          .append("<p>... (konten lainnya dihapus untuk menghemat ukuran)</p>");
      }
    }
    // Batasi jumlah tabel jika terlalu banyak
    const tables = $("table");
    if (tables.length > 5) {
      tables.slice(5).remove();
    }
  }

  static extractMainContent(html: string): string {
    const $ = cheerio.load(html);
    const mainSelectors: string[] = [
      "main",
      "article",
      "#content",
      "#main",
      ".content",
      ".main",
      ".post",
      ".article",
      'div[role="main"]',
      ".main-content",
    ];
    for (const selector of mainSelectors) {
      const mainElement = $(selector);
      if (
        mainElement.length &&
        mainElement.text() &&
        mainElement.text().trim().length > 100
      ) {
        return $.html(mainElement);
      }
    }
    return this.clean(html);
  }
}

export default HTMLCleaner;
