const PDFDocument = require('pdfkit');
const svgToPdf = require('svg-to-pdfkit')
const fs = require('fs')
const path = require('path')
const hummus = require('hummus')

sheetPath = "./temp/"

fs.readdir(sheetPath, (err, files) => {
	if (err) {
		console.error("Unable to scan temp directory")
	}

	files.forEach((file) => {
		convert(path.join(sheetPath, file))
	})
	setTimeout(merge, 2000)
})

let convert = (filename) => {
	if (filename.includes("svg") && !filename.includes("pdf")) {
		let svg = fs.readFileSync(filename).toString('utf-8');

		let doc = new PDFDocument({
			size: [468, 600]
		})
		let stream = fs.createWriteStream(filename + ".pdf")

		svgToPdf(doc, svg, 0, 0)

		doc.pipe(stream);
		doc.end();
	}
}

let merge = () => {
	fs.readdir(sheetPath, (err, files) => {
		if (err) {
			console.error("Unable to scan PDFs")
		}

		let toConvert = []
		files.forEach((file) => {
			if (file.includes("pdf")) {
				toConvert.push(path.join(sheetPath, file))
			}
		})

		var writer = require('hummus').createWriter('output.pdf')
		toConvert.forEach((pdfFile) => {
			console.log(pdfFile)
			writer.appendPDFPagesFromPDF(pdfFile)
		})
		writer.end()
	})
}
/*
let svg = fs.readFileSync(path).toString('utf-8');

let doc = new PDFDocument({
	size: [468, 600]
})
let stream = fs.createWriteStream("temp/page1.pdf")

svgToPdf(doc, svg, 0, 0)

stream.on("finish", () => {
	console.log(fs.readFileSync("temp/page1.pdf"))
})

doc.pipe(stream);
doc.scale(1.5)
doc.end();
*/