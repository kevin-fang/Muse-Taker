const puppeteer = require('puppeteer')
const fs = require('fs')
const axios = require('axios')
const link = "https://musescore.com/user/29410427/scores/5726739"
//const link = "https://musescore.com/derykafrank/light-of-the-seven-got"
const convert_and_merge = require('./convert_and_merge.js')

const download_image = (url, image_path) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      }),
  );

if (!fs.existsSync("./temp")) {
	fs.mkdirSync("temp")
} 

const scrapeMusescore = async () => {
	let urls = []
	const browser = await puppeteer.launch({
		headless: false
	})
	const page = await browser.newPage()

	page.on('requestfinished', (req) => {
		let url = req.url();
		if (url.includes("svg")) {
			console.log(url)
			urls.push(url)
			download_image(url, `temp/page${urls.length}.svg`)
		}
	})
	await page.goto(link)
	await page.setViewport({ width: 1920, height: 1080 });
	const scrollableSelector = "._28Ry7._2I8aD._1UgAz"
	await page.waitForSelector(scrollableSelector)

	let scrollHeight = 0
	await page.evaluate(selector => {
		const scrollable = document.querySelector(selector)
		let scrolled = 0
		scrollHeight = scrollable.scrollHeight
		let scroller = setInterval(() => {
			if (scrolled < scrollHeight) {
				scrollable.scrollBy(0, 500)
				scrolled += 500
				console.log("scrolling: ", scrolled + "/" + scrollHeight)
			} else {
				console.log("finished scrolling")
				clearInterval(scroller)
				throw new Error("done_scrolling_workaround")
			}
		}, 500)
		console.log("out of scroller")
	}, scrollableSelector)
	page.on("pageerror", (err) => {
		let msg = err.toString()
		if (msg.includes("done_scrolling_workaround")) {
			console.log("done!")
			convert_and_merge("./temp")
			browser.close()
		}
	})
	//browser.close()
}

let run = async () => {
	try {
		await scrapeMusescore()
	} catch (e) {
		console.error(e)
		process.exit()
	}
}

run()