const Page = require('./helper/page');

let page;

beforeEach(async ()=>{
  page = await Page.build();
  await page.goto('http://localhost:3000');
}, 100000);

afterEach(async ()=>{
  await page.close();
});

describe('When logged in', async () => {
	beforeEach(async() => {
		await page.login();
  		await page.click('a[href="/blogs/new"]');
	}, 100000);
	test('can see create new blog form', async () => {
	  const text = await page.getContentOf('form label');
	  expect(text).toEqual('Blog Title');
	});

	describe('And put valid inputs', async () => {
		 beforeEach(async () =>{
		 	await page.type('.title input', 'My Title');
		 	await page.type('.content input', 'This is a test blog..');

		 	await page.click('form button');
		 }, 30000);

		 test('submitting takes the user to the review page', async () =>{
		 	const text = await page.getContentOf('h5');

		 	expect(text).toEqual('Please confirm your entries')
		 });
		 test('should add the blog to index page', async () =>{
		 	await page.click('button.green');
		 	await page.waitFor('.card');

		 	const title = await page.getContentOf('.card-title');
		 	const content = await page.getContentOf('p');

		 	expect(title).toEqual('My Title');
		 	expect(content).toEqual('This is a test blog..');
		 });
	});

	describe('And put invalid inputs', async () => {
		beforeEach(async()=>{
			await page.click('form button')
		});
		test('an error will appear', async () => {
			const titleError 	= await page.getContentOf('.title .red-text');
			const contentError  = await page.getContentOf('.content .red-text');

			expect(titleError).toEqual('You must provide a value');
			expect(contentError).toEqual('You must provide a value');
		});
	});
});

// describe('When no user logged in', async () =>{
// 	test('not able to create a blog post', async ()=> {
// 		const result = await page.evaluate(() => {
// 			return fetch('/api/blogs', {
// 				method: 'POST',
// 				credentials: 'same-origin',
// 				headers: {
// 					'Content-Type': 'application/json'
// 				},
// 				body: JSON.stringify({
// 					title: 'My Title',
// 					content: 'My blog content'
// 				})
// 			}).then(res => res.json());
// 		});

// 		expect(result).toEqual({ error: 'You must log in!' });
// 	});
// 	test('not able to get all the blogs post', async ()=> {
// 		const result = await page.evaluate(() => {
// 			return fetch('/api/blogs', {
// 				method: 'GET',
// 				credentials: 'same-origin',
// 				headers: {
// 					'Content-Type': 'application/json'
// 				}
// 			}).then(res => res.json());
// 		});

// 		expect(result).toEqual({ error: 'You must log in!' });
// 	})
// });

// REFRACTORING THE ABOVE TESTS

describe('When no user logged in', async () =>{

	const actions = [
		{
			method: 'post', // run as post() method from the customPage class
			path: '/api/blogs',
			data: { title: "T", content: "C" }
		},
		{
			method: 'get',
			path: '/api/blogs'
		}];

	test('Blog related actions are prohibited', async ()=> {
		const results = await page.execRequests(actions)

		for(let result of results){
			expect(result).toEqual({ error: 'You must log in!' });	
		};
	});
});
