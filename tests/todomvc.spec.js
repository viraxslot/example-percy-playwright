const percySnapshot = require('@percy/playwright');
const {test, expect} = require('@playwright/test');

const PORT = process.env.PORT_NUMBER || 8000;
const TEST_URL = `http://localhost:${PORT}`;

test.describe('TodoMVC', function () {
    let server;

    test.beforeAll(async function () {
        server = await new Promise((resolve) => {
            let server = require('http')
                .createServer((req, res) => {
                    require('serve-handler')(req, res, {public: `${__dirname}/..`, cleanUrls: true});
                })
                .listen(PORT, () => resolve(server));
        });
    });

    test.beforeEach(async function ({page}) {
        await page.goto(TEST_URL);
        await page.evaluate(() => localStorage.clear());
    });

    test('Loads the app', async function ({page}) {
        let mainContainer = await page.$('section.todoapp');
        expect(mainContainer).toBeDefined();

        await percySnapshot(page, 'Loads the app');
    });

    test('Accepts a new todo', async function ({page}) {
        await page.type('.new-todo', 'New fancy todo 1');
        await page.keyboard.press('Enter');

        let todoCount = await page.evaluate(() => document.querySelectorAll('.todo-list li').length);
        expect(todoCount).toEqual(1);

        await percySnapshot(page, 'Snapshot with new todo', {widths: [300]});
    });

    test.afterAll(() => {
        server.close();
    });
});
