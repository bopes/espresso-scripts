const request = require("request");
const fs = require("fs");

// User credentials
const user = process.env.BROWSERSTACK_USER;
const key = process.env.BROWSERSTACK_ACCESSKEY;

// API base URL
const baseUrl = "https://" + user + ":"+ key + "@api-cloud.browserstack.com/app-automate/";


// Upload App & Return URL
function uploadApp() {
	return new Promise(resolve => {
			const res = request.post(baseUrl + "upload", (err, res, body) => {
			  if (err) { console.log(err); }
			  resolve(JSON.parse(body).app_url)
			});
			res.form().append('file', fs.createReadStream(__dirname + "/Calculator.apk"))
	});
}

// Upload Tests & Return URL
function uploadTests() {
	return new Promise(resolve => {
			const res = request.post(baseUrl + "espresso/test-suite", (err, res, body) => {
			  if (err) { console.log(err); }
			  resolve(JSON.parse(body).test_url)
			});
			res.form().append('file', fs.createReadStream(__dirname + "/CalculatorTest.apk"))
	});
}

// Execute Tests
function executeTests(appUrl, testUrl) {

	var formData = JSON.stringify({
		app: appUrl,
		testSuite: testUrl,
		devices: ["Samsung Galaxy S8-7.0"],
		deviceLogs: true,
	});

	console.log(formData);

	request.post({url:baseUrl + "espresso/build", form:formData}, (err,res,body) => {
		if (err) { console.log(err); }
		console.log(body);
	});
}


// Runner
async function go() {
	try {
		appUrl = await uploadApp();
		testUrl = await uploadTests();
		executeTests(appUrl, testUrl);
	} catch (e) {
		console.error(e);
	}
}
go();