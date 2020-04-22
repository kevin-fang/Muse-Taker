const PDFDocument = require('pdfkit');
const svgToPdf = require('svg-to-pdfkit')
const fs = require('fs')
const path = require('path')
const hummus = require('hummus')
const sharp = require('sharp')

let sheetPath

let numPages = 0
let processedPages = 0
const convert_and_merge = (folder_path) => {
	console.log("STARTING CONVERT")
	sheetPath = folder_path
	fs.readdir(sheetPath, (err, files) => {
		console.log(sheetPath)
		if (err) {
			console.error("Unable to scan temp directory")
		}

		files.map((file) => {
			if (file.includes("svg") && !file.includes("pdf")) {
				sharp(file)
					.resize(691, 792)
					.toFile("resized" + file)
				numPages++
			}
		})

		files.map((file) => {
			convert(path.join("./temp", file))
		})

	})
}

let convert = (filename) => {
	if (filename.includes("svg") && !filename.includes("pdf")) {
		let svg = fs.readFileSync(filename).toString('utf-8');

		let doc = new PDFDocument({
			size: [2976.38, 4209.45]
		})
		let stream = fs.createWriteStream(filename + ".pdf")

		svgToPdf(doc, svg, 0, 0)

		doc.pipe(stream);
		doc.end();
		console.log(processedPages + 1 + "/" + numPages)
		finish()
	}
}

let finish = () => {
	processedPages++
	if (processedPages == numPages) {
		setTimeout(merge, 2000)
	}
}

let merge = () => {
	console.log("merging")
	fs.readdir(sheetPath, (err, files) => {
		if (err) {
			console.error("Unable to scan PDFs")
		}

		let toConvert = []
		files.forEach((file) => {
			//print(file)
			if (file.includes("pdf")) {
				toConvert.push(path.join(sheetPath, file))
			}
		})

		var writer = require('hummus').createWriter('./output.pdf')
		toConvert.forEach((pdfFile) => {
			console.log(pdfFile)
			writer.appendPDFPagesFromPDF(pdfFile)
		})
		writer.end()
	})
}

//convert_and_merge("./temp")

module.exports = convert_and_merge