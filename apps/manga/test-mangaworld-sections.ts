import * as cheerio from 'cheerio';
import * as fs from 'fs';

async function analyzeSections() {
  try {
    const html = fs.readFileSync('/tmp/mangaworld-homepage.html', 'utf-8');
    const $ = cheerio.load(html);

    console.log('=== Analyzing MangaWorld Sections ===\n');

    // Find all section headers with their parent structure
    const headers = [
      'Capitoli di tendenza',
      'Ultimi capitoli aggiunti',
      'Ultime aggiunte'
    ];

    for (const headerText of headers) {
      console.log(`\n--- Section: "${headerText}" ---`);

      // Find the header element
      const headerElement = $('*:contains("' + headerText + '")').filter(function() {
        return $(this).text().trim() === headerText;
      }).first();

      if (headerElement.length > 0) {
        console.log('✓ Found header');

        // Get the parent container
        let container = headerElement.parent();
        while (container.length > 0 && container.prop('tagName') !== 'BODY') {
          const children = container.children().not(headerElement);
          if (children.length > 0) {
            console.log(`  Parent container: ${container.prop('tagName')} class="${container.attr('class') || ''}"`);
            console.log(`  Siblings (non-header): ${children.length} elements`);

            // Find items in this container
            const items = container.find('.entry, .thumb, .manga-item, .update-item');
            if (items.length > 0 && items.length < 100) {
              console.log(`  Items found: ${items.length}`);

              items.slice(0, 2).each((i, el) => {
                const $el = $(el);
                const img = $el.find('img').first();
                const link = $el.find('a[href]').first();
                const chapter = $el.find('.chapter').first();
                const title = $el.find('.title, h3, h2').first();

                console.log(`\n    Item ${i}:`);
                console.log(`      Class: ${$el.attr('class')}`);
                if (title.length > 0) {
                  console.log(`      Title: ${title.text().trim()}`);
                }
                if (link.length > 0) {
                  console.log(`      Link: ${link.attr('href')}`);
                }
                if (img.length > 0) {
                  console.log(`      Img: ${img.attr('src') || img.attr('data-src')}`);
                }
                if (chapter.length > 0) {
                  console.log(`      Chapter: ${chapter.text().trim()}`);
                }
              });
            }
            break;
          }
          container = container.parent();
        }
      } else {
        console.log('✗ Header not found');
      }
    }

    // Also check all .entry elements in the page
    console.log('\n\n=== All .entry elements ===');
    const allEntries = $('.entry');
    console.log(`Total: ${allEntries.length}`);

    allEntries.each((i, el) => {
      const $el = $(el);
      const img = $el.find('img').first();
      const link = $el.find('a[href]').first();
      const chapter = $el.find('.chapter').first();

      if (link.length > 0) {
        const href = link.attr('href');
        const hasChapter = chapter.length > 0;

        console.log(`\nEntry ${i}: class="${$el.attr('class')}"`);
        console.log(`  Link: ${href}`);
        console.log(`  Has chapter info: ${hasChapter}`);
        if (hasChapter) {
          console.log(`  Chapter text: ${chapter.text().trim()}`);
        }
        if (img.length > 0) {
          console.log(`  Has image: yes`);
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeSections();
