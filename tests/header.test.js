const Page = require('./helper/page');

let page; // this page variable will be available for all the scopes as this is  globel
beforeEach( async ()=>{
  page = await Page.build();
  await page.goto('http://localhost:3000');
}, 100000);

afterEach( async()=>{
  await page.close()
});

test('matching the logo text', async () => {
  const text = await page.getContentOf('a.brand-logo');

  expect(text).toEqual('Blogster')
});

test('the login button to google OAuth', async () =>{
  await page.click('.right a');

  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/)
});

test('When loggedin , shows LogOut button', async ()=>{
  await page.login();
  const text = await page.getContentOf('a[href="/auth/logout"]');

  expect(text).toEqual('Logout');

});
